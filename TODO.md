# Low Priority Tasks - TODO

## 🔧 Additional AI Backends
- [ ] **OpenAI Integration**
  - Add OpenAI API support (GPT-4o, GPT-4o-mini)
  - Create OpenAI provider hook similar to useGemini
  - Add OpenAI configuration panel
  - Test code generation quality vs Gemini

- [ ] **Ollama Local Integration** 
  - Add Ollama local server support (http://localhost:11434)
  - Support for DeepSeek Coder V2, CodeLlama, Llama 3.1
  - Add model discovery and management
  - Local privacy-focused workflow

- [ ] **GPT-OSS Integration**
  - Add llama.cpp server support for OpenAI's open-source models
  - Support GPT-OSS 20B and 120B variants
  - Hardware requirements detection
  - Local inference without API costs

- [ ] **Backend Selection UI**
  - Provider dropdown in configuration panel
  - Dynamic settings based on selected provider
  - Connection testing for each provider
  - Provider status indicators

## 🎨 UI/UX Enhancements
- [ ] **UI/UX Overhaul**: Improve layout, theming, and visual appeal. Implement a responsive design for mobile and desktop.
- [x] **About Page**: Create a simple, static "About" page for the OpenPAD application.
- [x] **Display Generation Info**: Show the raw response or reasoning from the Gemini model to help users iteratively improve their prompts.
- [ ] **Code Editor with Syntax Highlighting**
  - Integrate Monaco Editor for OpenSCAD
  - Syntax highlighting for OpenSCAD language
  - Auto-completion for OpenSCAD functions
  - Error detection and highlighting
  - Code formatting and linting

- [ ] **Advanced 3D Viewer Features**
  - Animation support for parametric changes
  - Cross-section view mode
  - Measurement tools
  - Multiple camera angles presets
  - Screenshot/image export functionality

- [ ] **Polished Design System**
  - Professional color scheme and typography
  - Consistent spacing and layouts
  - [x] Loading animations and micro-interactions (Implemented pulsing button).
  - [x] Toast notifications for user feedback.
  - [ ] Dark/light theme toggle

## 🤖 AI & Prompting
- [x] **Configurable AI Models**: Allow users to select between available Gemini models (e.g., Flash, Pro).
- [x] **On-demand Filename Generation**: Generate a descriptive, file-safe filename for downloads using a separate AI call.
- [ ] **Advanced Prompt Engineering**: Systematically improve the master prompt sent to the AI to enhance the quality and complexity of the generated OpenSCAD code.
- [ ] **Prompt Management**: Allow users to save, load, and manage a history of their prompts.

## 🖼️ Image Generation (New Feature)
- [ ] **AI Image Generation**: Integrate an image generation model (e.g., via Gemini) to create a 2D rendering of the 3D model based on a descriptive prompt.

## 📁 Advanced Export Options
- [ ] **Modern File Formats**
  - OBJ export for broader 3D software compatibility
  - 3MF export for advanced 3D printing features
  - STEP export for CAD software integration
  - PLY export for point cloud applications

- [ ] **Export Quality Options**
  - Resolution/quality settings for different formats
  - Batch export multiple variations
  - Export progress indicators
  - File size optimization options

## 🚀 Production Features
- [ ] **Performance Optimizations**
  - Code splitting and lazy loading
  - Bundle size optimization
  - CDN integration for assets
  - Service worker for offline capability
  - Progressive Web App (PWA) features

- [ ] **Advanced Error Handling**
  - Retry mechanisms for failed API calls
  - Graceful degradation for offline mode
  - User-friendly error messages
  - Error reporting and analytics
  - Automatic recovery suggestions

- [ ] **User Experience**
  - Onboarding tutorial for new users
  - [x] Keyboard shortcuts for power users (Ctrl+Enter to generate).
  - Project save/load functionality
  - Version history for generated models
  - Collaborative features (sharing models)

## 🔒 Security & Privacy
- [ ] **Enhanced Security**
  - API key encryption at rest
  - Rate limiting protection
  - Input sanitization and validation
  - HTTPS enforcement in production
  - Security headers implementation

- [ ] **Privacy Features**
  - Local-only mode (no cloud APIs)
  - Data retention controls
  - Privacy policy compliance
  - User data export/deletion
  - Anonymous usage analytics opt-in

## 🧪 Testing & Quality
- [x] **Comprehensive Test Coverage**
  - Frontend Unit Tests (Vitest): Write unit and component tests for the React components.
- [x] **Backend Unit Tests (Jest)**: Write unit and integration tests for the Fastify API endpoints. (Fixed filename.test.ts, created and fixed generate.test.ts)
  - Visual regression testing
  - Cross-browser compatibility testing
  - Performance benchmarking
  - Accessibility testing (WCAG compliance)
  - Load testing for API endpoints

- [ ] **Development Tools**
  - Storybook for component development
  - E2E testing with Playwright
  - API mocking for development
  - Hot reloading improvements
  - Development debug tools

## 📊 Analytics & Monitoring
- [ ] **Usage Analytics**
  - Model generation success rates
  - Popular prompt patterns
  - Performance metrics tracking
  - User journey analysis
  - Feature usage statistics

- [ ] **Error Monitoring**
  - Real-time error tracking
  - Performance monitoring
  - API response time tracking
  - User experience metrics
  - Health check endpoints

## 🔧 Developer Experience
- [ ] **Documentation Improvements**
  - Interactive API documentation
  - Component documentation with examples
  - Architecture decision records (ADRs)
  - Contributing guidelines
  - Deployment guides

- [x] **Build & Deploy Enhancements**
  - [x] Add Health Check Endpoint to the Backend.
  - Automated testing pipelines
  - Multi-stage Docker builds
  - Environment-specific configurations
  - Automated dependency updates
  - Blue-green deployment strategy

## 📱 Platform Support
- [ ] **Mobile Support**
  - Responsive design for mobile devices
  - Touch-friendly controls for 3D viewer
  - Mobile-optimized file export
  - Progressive Web App for mobile
  - Native mobile app consideration

- [ ] **Desktop Integration**
  - Electron wrapper for desktop app
  - File system integration
  - Native file associations
  - System tray integration
  - Auto-updater functionality

---

## Priority Legend
- 🔧 **High Priority**: Core functionality extensions
- 🎨 **Medium Priority**: User experience improvements
- 📁 **Medium Priority**: Feature additions
- 🚀 **Low Priority**: Production optimizations
- 🔒 **Low Priority**: Advanced security features
- 🧪 **Ongoing**: Testing and quality assurance
- 📊 **Future**: Analytics and insights
- 📱 **Future**: Platform expansion

**Note**: Items should be prioritized based on user feedback and actual usage patterns once the MVP is deployed.
