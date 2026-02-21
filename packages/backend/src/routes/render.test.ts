import { build } from "../../test/helper";

jest.mock("child_process", () => ({
  execFile: jest.fn((cmd, args, cb) => {
    if (cmd === "openscad") {
      cb(null, "stdout", "");
    } else {
      cb(new Error("Unknown command"), "", "");
    }
  }),
}));

jest.mock("fs/promises", () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from("mock-stl-data")),
  mkdtemp: jest.fn().mockResolvedValue("/tmp/openpad-test"),
  rm: jest.fn().mockResolvedValue(undefined),
}));

import { execFile } from "child_process";

test("POST /api/render should return STL data", async () => {
  const app = await build();

  (execFile as unknown as jest.Mock).mockImplementation((cmd, args, cb) => {
    cb(null, "stdout", "");
  });

  const response = await app.inject({
    method: "POST",
    url: "/api/render",
    payload: {
      code: "cube(10);",
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty("stl");
});
