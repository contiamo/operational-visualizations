import { tickFormatter, ticksInDomain, adjustRange } from "../compute_time_axes"
import { TimeAxisOptions } from "../typings";

describe("compute time axes", () => {
  describe("tickFormatter", () => {
    const date = new Date("12-10-2018-15:00")
    expect(tickFormatter("hour")(date)).toEqual("Dec 10 15:00")
    expect(tickFormatter("day")(date)).toEqual("Dec 10")
    expect(tickFormatter("week")(date)).toEqual("W49")
    expect(tickFormatter("month")(date)).toEqual("Dec 18")
    expect(tickFormatter("quarter")(date)).toEqual("Q4 2018")
    expect(tickFormatter("year")(date)).toEqual("2018")
  })

  it("ticksInDomain", () => {
    expect(ticksInDomain(
      { type: "time", start: new Date("12-10-2018-10:00"), end: new Date("12-10-2018-12:00"), interval: "hour" }
    )).toEqual(
      [new Date("12-10-2018-10:00"), new Date("12-10-2018-11:00"), new Date("12-10-2018-12:00")]
    )
    expect(ticksInDomain(
      { type: "time", start: new Date("12-10-2018"), end: new Date("12-12-2018"), interval: "day" }
    )).toEqual(
      [new Date("12-10-2018"), new Date("12-11-2018"), new Date("12-12-2018")]
    )
    expect(ticksInDomain(
      { type: "time", start: new Date("12-01-2018"), end: new Date("12-17-2018"), interval: "week" }
    )).toEqual(
      [new Date("12-01-2018"), new Date("12-08-2018"), new Date("12-15-2018")]
    )
    expect(ticksInDomain(
      { type: "time", start: new Date("Jan 2018"), end: new Date("Apr 2018"), interval: "month" }
    )).toEqual(
      [new Date("Jan 2018"), new Date("Feb 2018"), new Date("Mar 2018"), new Date("Apr 2018")]
    )
    expect(ticksInDomain(
      { type: "time", start: new Date("Jan 2018"), end: new Date("Dec 2018"), interval: "quarter" }
    )).toEqual(
      [new Date("Jan 2018"), new Date("Apr 2018"), new Date("Jul 2018"), new Date("Oct 2018")]
    )
    expect(ticksInDomain(
      { type: "time", start: new Date("Mar 2018"), end: new Date("Jul 2020"), interval: "year" }
    )).toEqual(
      [new Date("Mar 2018"), new Date("Mar 2019"), new Date("Mar 2020")]
    )
  })

  describe("adjustRange", () => {
    const options: TimeAxisOptions = {type: "time", start: new Date("Mar 2018"), end: new Date("Jul 2020"), interval: "year"}
    it("no bars", () => {
      expect(adjustRange({
        range: [0, 300],
        values: ticksInDomain(options),
        hasBars: false,
        options
      })).toEqual([0, 300])
    })
    it("bars, positive range", () => {
      expect(adjustRange({
        range: [0, 300],
        values: ticksInDomain(options),
        hasBars: true,
        options
      })).toEqual([50, 250])
    })
    it("bars, negative range", () => {
      expect(adjustRange({
        range: [300, 0],
        values: ticksInDomain(options),
        hasBars: true,
        options
      })).toEqual([250, 50])
    })
  })
})
