import type { Input } from "@/game/world";

export type Action = keyof Input;

/**
 * 키보드와 화면 버튼의 누름 상태를 모아 매 프레임 한 번씩 입력으로 내준다.
 * 프레임 사이에 눌렀다 뗀 점프도 다음 프레임에 한 번은 반영한다.
 */
export function createControls() {
  let held: Input = { left: false, right: false, jump: false };
  let jumpQueued = false;

  return {
    press(action: Action) {
      held = { ...held, [action]: true };
      if (action === "jump") jumpQueued = true;
    },
    release(action: Action) {
      held = { ...held, [action]: false };
    },
    releaseAll() {
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
