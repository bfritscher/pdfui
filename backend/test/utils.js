import { describe, expect, it } from "vitest";
import { angleToDirection, pagesToCommands } from "../utils/index.js";

describe("utils", () => {
  describe("angleToDirection", () => {
    it("converts 0 to empty string", () => {
      expect(angleToDirection(0)).toBe("");
    });
    it("converts 90 to right", () => {
      expect(angleToDirection(90)).toBe("right");
    });
    it("converts -90 to left", () => {
      expect(angleToDirection(-90)).toBe("left");
    });
    it("converts 180 to down", () => {
      expect(angleToDirection(180)).toBe("down");
    });
    it("converts -180 to down", () => {
      expect(angleToDirection(-180)).toBe("down");
    });
    it("converts multiples of 90", () => {
      expect(angleToDirection(450)).toBe("right");
      expect(angleToDirection(-450)).toBe("left");
      expect(angleToDirection(270)).toBe("left");
      expect(angleToDirection(-270)).toBe("right");
    });
    it("converts non multiple of 90 to empty string", () => {
      expect(angleToDirection(275)).toBe("");
      expect(angleToDirection(-85)).toBe("");
    });
  });

  describe("pagesToCommands", () => {
    it("converts multiple files multiple order and rotations, ignore remove", () => {
      expect(
        pagesToCommands({ A: "a01", B: "a02" }, [
          {
            src: "A",
            page: 1,
            cutBefore: false,
            remove: false,
            angle: 0,
            data: { name: "out1" },
          },
          {
            src: "A",
            page: 2,
            cutBefore: false,
            remove: true,
            angle: -90,
          },
          {
            src: "B",
            page: 1,
            cutBefore: false,
            remove: false,
            angle: 0,
          },
          {
            src: "B",
            page: 2,
            cutBefore: true,
            remove: false,
            angle: 90,
            data: { name: "abc" },
          },
        ]),
      ).toEqual([
        "pdftk A=a01 B=a02 cat A1 B1 output out1.pdf",
        "pdftk A=a01 B=a02 cat B2right output abc.pdf",
      ]);
    });
    it("removes some files from one pdf", () => {
      expect(
        pagesToCommands({ A: "a01" }, [
          {
            src: "A",
            page: 1,
            cutBefore: true,
            remove: false,
            angle: 0,
            data: { name: "out1" },
          },
          {
            src: "A",
            page: 2,
            cutBefore: false,
            remove: true,
            angle: -90,
          },
          {
            src: "A",
            page: 4,
            cutBefore: false,
            remove: false,
            angle: 0,
          },
          {
            src: "A",
            page: 7,
            cutBefore: true,
            remove: true,
            angle: 90,
            data: { name: "abc" },
          },
        ]),
      ).toEqual(["pdftk A=a01 cat A1 A4 output out1.pdf"]);
    });
  });
});
