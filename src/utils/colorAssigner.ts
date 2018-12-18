export type UsageCount = Record<string, number>;

export const colorAssigner = (palette: string[]) => {
  if (palette.length === 0) {
    throw new Error("No color palette defined");
  }

  const assigned: Record<string, string> = {};
  const usedColors: string[] = [];

  const getColor = (key: string) => {
    return assigned[key];
  };

  const nextColor = () => {
    // Count how many times each colour has been used
    const usageCount = palette.reduce<UsageCount>((memo, color) => {
      memo[color] = 0;
      return memo;
    }, {});

    usedColors.forEach(color => {
      usageCount[color] += 1;
    });

    const min = palette.reduce<number | undefined>(
      (memo, color) => (memo ? Math.min(memo, usageCount[color]) : usageCount[color]),
      undefined,
    );

    // Find a color with the minimum usage count
    return palette.find(color => usageCount[color] === min) as string;
  };

  const assignColor = (key: string) => {
    const color = nextColor();
    assigned[key] = color;
    usedColors.push(color);
    return color;
  };

  return (key: string) => {
    return getColor(key) || assignColor(key);
  };
};
