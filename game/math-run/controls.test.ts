import { describe, expect, it } from "vitest";

import { createControls } from "./controls";

describe("조작 입력", () => {
  it("누르고 있는 동안 그 방향 입력이 계속 들어간다", () => {
    const controls = createControls();
    controls.press("right");

    expect(controls.consume().right).toBe(true);
    expect(controls.consume().right).toBe(true);

    controls.release("right");
    expect(controls.consume().right).toBe(false);
  });

  it("다음 프레임 전에 눌렀다 뗀 짧은 점프도 한 번은 들어간다", () => {
    const controls = createControls();
    controls.press("jump");
    controls.release("jump");

    expect(controls.consume().jump).toBe(true);
    expect(controls.consume().jump).toBe(false);
  });

  it("점프를 누르고 있으면 계속 점프 입력이 들어간다", () => {
    const controls = createControls();
    controls.press("jump");

    expect(controls.consume().jump).toBe(true);
    expect(controls.consume().jump).toBe(true);
  });

  it("모두 놓으면 누르고 있던 입력과 대기 중인 점프가 모두 사라진다", () => {
    const controls = createControls();
    controls.press("right");
    controls.press("jump");
    controls.release("jump");

    controls.releaseAll();

    expect(controls.consume()).toEqual({ left: false, right: false, jump: false });
  });
});
