import { generateWithGemini, generateWithOllama } from '../src/llm';
import { basePrompt, modularPrompt } from '../src/prompts';
import { execFile } from 'child_process';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { promisify } from 'util';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

const execFileAsync = promisify(execFile);

// Load .env from project root
dotenv.config({ path: resolve(__dirname, '../../../.env') });

// Parse CLI Arguments
const args = process.argv.slice(2);
const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

// Configuration
const OUTPUT_DIR = join(__dirname, '../../eval_output');
const VISION_MODEL = getArg('--validator') || getArg('--vision') || 'llava:7b';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

const SCENARIOS = [
  {
    name: 'Simple Cube',
    prompt: 'A 20mm cube with centered origin.',
  },
  {
    name: 'NEMA 17 Bracket',
    prompt: 'A mounting bracket for a NEMA 17 stepper motor with 4 mounting holes and a central shaft hole.',
  },
  {
    name: 'Parametric Box',
    prompt: 'A parametric box with a sliding lid. Parameters: width=100, depth=50, height=30.',
  },
];

// Models to test
let CONFIGS = [
  { provider: 'ollama', model: 'gemma3:4b' },
];

const cliModel = getArg('--model');
const cliProvider = getArg('--provider');

if (cliModel) {
  const provider = cliProvider || (cliModel.includes('gemini') ? 'gemini' : 'ollama');
  CONFIGS = [{ provider, model: cliModel }];
}

async function validateWithVision(imagePath: string, originalPrompt: string): Promise<{ pass: boolean; reason: string }> {
  try {
    const imageBuffer = await readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const validationPrompt = `
      You are a QA inspector for 3D models.
      User Request: "${originalPrompt}" 
      
      Look at the attached image of the rendered 3D model.
      Does the *geometric shape* reasonably match the user's request?
      - Ignore specific dimensions (e.g., "20mm") as you cannot measure them.
      - Ignore "centered origin" or alignment constraints as they are not visible.
      - Focus ONLY on whether the shape looks correct (e.g., is it a cube? is it a bracket?).
      
      Respond with strictly JSON: {"pass": true/false, "reason": "brief explanation"}
    `;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: VISION_MODEL,
        prompt: validationPrompt,
        images: [base64Image],
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
       return { pass: false, reason: `Vision API Error: ${response.status}` };
    }

    const data: any = await response.json();
    const result = JSON.parse(data.response);
    return result;

  } catch (error: any) {
    return { pass: false, reason: `Validation Failed: ${error.message}` };
  }
}

async function runEval() {
  console.log('🚀 Starting Prompt Evaluation (Batch Mode)...\n');
  
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  const tasks: any[] = [];

  // --- Phase 1: Generation & Compilation ---
  console.log('--- Phase 1: Generation & Compilation ---\n');
  for (const config of CONFIGS) {
    console.log(`Provider: ${config.provider.toUpperCase()} Model: ${config.model}`);
    console.log('='.repeat(60));
    
    for (const scenario of SCENARIOS) {
      process.stdout.write(`Generating "${scenario.name}"... `);
      
      const fullPrompt = `
        ${basePrompt}
        ${modularPrompt}
        
        **User Request:** "${scenario.prompt}"
      `;

      try {
        const start = Date.now();
        let result;
        
        if (config.provider === 'ollama') {
          result = await generateWithOllama({
            prompt: fullPrompt,
            model: config.model,
            apiHost: OLLAMA_HOST
          });
        } else {
          result = await generateWithGemini({
            prompt: fullPrompt,
            model: config.model,
            apiKey: process.env.GEMINI_API_KEY
          });
        }
        
        const duration = Date.now() - start;

        // Extract code
        let code = result.text;
        const match = code.match(/```openscad\n([\s\S]*?)```/);
        if (match) code = match[1];

        // Paths
        const filenameSafe = scenario.name.toLowerCase().replace(/\s+/g, '-');
        const scadPath = join(OUTPUT_DIR, `${config.provider}-${filenameSafe}.scad`);
        const stlPath = join(OUTPUT_DIR, `${config.provider}-${filenameSafe}.stl`);
        const pngPath = join(OUTPUT_DIR, `${config.provider}-${filenameSafe}.png`);
        const validationPath = join(OUTPUT_DIR, `${config.provider}-${filenameSafe}-validation.json`);
        
        await writeFile(scadPath, code);

        // Compile Check
        let compiled = false;
        try {
          await execFileAsync('openscad', ['-o', stlPath, scadPath]);
          // Generate PNG for later validation
          await execFileAsync('openscad', ['-o', pngPath, '--imgsize=512,512', '--autocenter', '--viewall', scadPath]);
          compiled = true;
        } catch (e) {
          compiled = false;
        }

        const status = compiled ? '✅ COMPILED' : '❌ FAILED';
        console.log(`${status} (${duration}ms)`);
        
        tasks.push({
            scenario: scenario.name,
            provider: config.provider,
            model: config.model,
            compiled,
            duration,
            pngPath,
            validationPath,
            prompt: scenario.prompt,
            visualPass: false,
            visualReason: 'N/A'
        });

      } catch (error: any) {
        console.log(`❌ ERROR: ${error.message}`);
      }
    }
  }

  // --- Phase 2: Visual Validation ---
  console.log('\n--- Phase 2: Visual Validation ---');
  const compiledTasks = tasks.filter(t => t.compiled);
  
  if (compiledTasks.length > 0) {
      console.log(`Validating ${compiledTasks.length} models with ${VISION_MODEL}...`);
      
      for (const task of compiledTasks) {
          process.stdout.write(`Validating "${task.scenario}"... `);
          const validation = await validateWithVision(task.pngPath, task.prompt);
          
          task.visualPass = validation.pass;
          task.visualReason = validation.reason;
          
          await writeFile(task.validationPath, JSON.stringify(validation, null, 2));
          console.log(validation.pass ? '✅ PASS' : '⚠️  FAIL');
      }
  } else {
      console.log('No compiled models to validate.');
  }

  // --- Report ---
  console.log('\n\n📊 SUMMARY REPORT');
  console.log('='.repeat(100));
  console.log('| Scenario           | Provider | Compiled | Visual | Duration | Reason');
  console.log('|---|---|---|---|---|---|');
  tasks.forEach(r => {
    const reason = r.visualReason.length > 30 ? r.visualReason.substring(0, 27) + '...' : r.visualReason;
    const visualStatus = r.compiled ? (r.visualPass ? 'PASS' : 'FAIL') : 'N/A ';
    console.log(`| ${r.scenario.padEnd(18)} | ${r.provider.padEnd(8)} | ${r.compiled ? 'YES' : 'NO '}      | ${visualStatus.padEnd(6)} | ${r.duration}ms | ${reason}`);
  });
  console.log('='.repeat(100));
  console.log(`\nArtifacts saved to: ${OUTPUT_DIR}`);
}

if (require.main === module) {
  runEval().catch(console.error);
}
