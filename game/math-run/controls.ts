import type { Input } from "@/game/world";

export type Action = keyof Input;

/**
 * 키보드와 화면 버튼의 누름 상태를 모아 매 프레임 한 번씩 입력으로 내준다.
 * 프레임 사이에 눌렀다 뗀 점프도 다음 프레임에 한 번은 반영한다.
 */
export function createControls() {
  let held: Input = { left: false, right: false, jump: false };
  let jumpQueued = false;
  // 퀴즈 중에도 키보드가 눌려 있는지 기록해 두어, 퀴즈가 닫힐 때 걷기를 이어 준다.
  const keys = new Set<Action>();
  let suspended = false;

  return {
    keyDown(action: Action) {
      keys.add(action);
      if (!suspended) this.press(action);
    },
    keyUp(action: Action) {
      keys.delete(action);
      this.release(action);
    },
    suspend() {
      suspended = true;
      this.releaseAll(false);
    },
    resume() {
      suspended = false;
      if (keys.has("left")) this.press("left");
      if (keys.has("right")) this.press("right");
    },
    press(action: Action) {
      held = { ...held, [action]: true };
      if (action === "jump") jumpQueued = true;
    },
    release(action: Action) {
      held = { ...held, [action]: false };
    },
    releaseAll(forgetKeys = true) {
      if (forgetKeys) keys.clear();
      held = { left: false, right: false, jump: false };
      jumpQueued = false;
    },
    consume(): Input {
      const input = { ...held, jump: held.jump || jumpQueued };
      jumpQueued = false;
      return input;
    },
  };
}
