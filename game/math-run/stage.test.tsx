import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/game/world", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/game/world")>();
  // 첫 프레임에서 영어 마을로 넘어간 상태를 만든다.
  return { ...actual, stepWorld: (state: object) => ({ ...state, stageIndex: 3 }) };
});
vi.mock("./draw-scene", () => ({ drawScene: vi.fn() }));

import { Stage } from "./stage";

describe("Stage 캔버스 접근성 이름", () => {
  beforeEach(() => {
    // jsdom은 2D 컨텍스트를 주지 않으므로 게임 루프가 돌도록 가짜를 준다.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as never;
  });

  it("영어 마을에서는 현재 스테이지 이름을 따른다", async () => {
    render(<Stage face={null} route={[0, 1, 2, 3]} onFinished={() => {}} />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "영어 마을" })).toBeInTheDocument()
    );
    expect(screen.getByLabelText("영어 마을 게임 화면")).toBeInTheDocument();
  });
});
