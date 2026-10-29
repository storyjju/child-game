import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ParentRecord } from "@/game/record";

const first = { endedAt: 1, averageMs: { math: 3000, english: 5000 } };
const second = { endedAt: 2, averageMs: { math: 2400, english: 5200 } };

describe("부모님용 기록", () => {
  it("펼치기 전에는 풀이 시간 숫자가 보이지 않는다", () => {
    render(<ParentRecord records={[first]} />);

    expect(
      screen.getByRole("button", { name: /부모님용 기록/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/초/)).not.toBeInTheDocument();
  });

  it("첫 판이면 과목별 평균과 첫 기록 안내가 보인다", () => {
    render(<ParentRecord records={[first]} />);
    fireEvent.click(screen.getByRole("button", { name: /부모님용 기록/ }));

    expect(screen.getAllByText("산수 3.0초")).toHaveLength(2);
    expect(screen.getAllByText("영어 5.0초")).toHaveLength(2);
    expect(screen.getAllByText("첫 기록이에요")).toHaveLength(2);
  });

  it("지난 판과 비교하고 최근 판 목록을 보여 준다", () => {
    render(<ParentRecord records={[second, first]} />);
    fireEvent.click(screen.getByRole("button", { name: /부모님용 기록/ }));

    expect(
      screen.getByText("지난 판보다 0.6초 빨라졌어요"),
    ).toBeInTheDocument();
    expect(screen.getByText("지난 판 5.0초")).toBeInTheDocument();
    expect(screen.getByText("최근 2판")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
