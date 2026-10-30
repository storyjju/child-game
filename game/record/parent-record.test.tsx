import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { emptyMedals, ParentRecord, type PlayRecord } from "@/game/record";

function play(endedAt: number, ms: Partial<PlayRecord["averageMs"]>): PlayRecord {
  return {
    endedAt,
    averageMs: { math: null, multiplication: null, korean: null, english: null, ...ms },
  };
}

function open() {
  fireEvent.click(screen.getByRole("button", { name: /부모님용 기록/ }));
}

describe("부모님용 기록", () => {
  it("펼치기 전에는 풀이 시간 숫자와 메달이 보이지 않는다", () => {
    const first = play(1, { math: 3000 });
    render(
      <ParentRecord
        records={[first]}
        medals={{ ...emptyMedals(), math: [{ endedAt: 1, ms: 3000 }] }}
      />,
    );

    expect(screen.getByRole("button", { name: /부모님용 기록/ })).toBeInTheDocument();
    expect(screen.queryByText(/초/)).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "금메달" })).not.toBeInTheDocument();
  });

  it("이번 판에는 푼 과목만 평균이 나오고 첫 기록 안내가 붙는다", () => {
    render(
      <ParentRecord
        records={[play(1, { math: 3000, english: 5000 })]}
        medals={emptyMedals()}
      />,
    );
    open();

    const current = screen.getByRole("region", { name: "이번 판" });
    expect(within(current).getByText("산수 3.0초")).toBeInTheDocument();
    expect(within(current).getByText("영어 5.0초")).toBeInTheDocument();
    expect(within(current).queryByText(/곱셈/)).not.toBeInTheDocument();
    expect(within(current).queryByText(/국어/)).not.toBeInTheDocument();
    expect(within(current).getAllByText("첫 기록이에요")).toHaveLength(2);
  });

  it("같은 과목을 푼 가장 가까운 지난 판과 비교한다", () => {
    const records = [
      play(3, { math: 2400, korean: 4000 }),
      play(2, { english: 5000 }),
      play(1, { math: 3000 }),
    ];
    render(<ParentRecord records={records} medals={emptyMedals()} />);
    open();

    const current = screen.getByRole("region", { name: "이번 판" });
    expect(within(current).getByText("지난 판보다 0.6초 빨라졌어요")).toBeInTheDocument();
    expect(within(current).getByText("첫 기록이에요")).toBeInTheDocument();
  });

  it("과목별 메달 순위를 금·은·동으로 보여 주고 이번 판에 표시한다", () => {
    const records = [play(2, { math: 2400 }), play(1, { math: 3000, english: 5000 })];
    const medals = {
      ...emptyMedals(),
      math: [
        { endedAt: 2, ms: 2400 },
        { endedAt: 1, ms: 3000 },
      ],
      english: [{ endedAt: 1, ms: 5000 }],
    };
    render(<ParentRecord records={records} medals={medals} />);
    open();

    const section = screen.getByRole("region", { name: "메달 기록" });
    expect(within(section).getAllByRole("img", { name: "금메달" })).toHaveLength(2);
    expect(within(section).getAllByRole("img", { name: "은메달" })).toHaveLength(1);
    expect(within(section).queryByRole("img", { name: "동메달" })).not.toBeInTheDocument();
    expect(within(section).getAllByText("이번 판")).toHaveLength(1);
    expect(within(section).getByText("산수")).toBeInTheDocument();
    expect(within(section).getByText("영어")).toBeInTheDocument();
    expect(within(section).queryByText("곱셈")).not.toBeInTheDocument();
    expect(within(section).queryByText("국어")).not.toBeInTheDocument();
  });

  it("최근 판 목록에는 각 판에서 푼 과목만 나온다", () => {
    const records = [play(2, { math: 2400 }), play(1, { korean: 4000 })];
    render(<ParentRecord records={records} medals={emptyMedals()} />);
    open();

    const recent = screen.getByRole("region", { name: "최근 판" });
    expect(within(recent).getByText("최근 2판")).toBeInTheDocument();
    expect(within(recent).getAllByRole("listitem")).toHaveLength(2);
    expect(within(recent).getByText("산수 2.4초")).toBeInTheDocument();
    expect(within(recent).getByText("국어 4.0초")).toBeInTheDocument();
  });
});
