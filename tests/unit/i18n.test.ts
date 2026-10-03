import { describe, expect, it } from "vitest";

import { intlLocaleOf } from "@/lib/i18n/config";
import { messages, plural } from "@/lib/i18n/messages";
import { normalizeReferralCode } from "@/lib/validators";

const en = messages.en.waitlist.referral.referrals;
const ar = messages.ar.waitlist.referral.referrals;

describe("plural()", () => {
  it("uses English one/other forms", () => {
    expect(plural("en", 0, en, intlLocaleOf("en"))).toBe("No friends have joined yet");
    expect(plural("en", 1, en, intlLocaleOf("en"))).toBe("1 friend joined");
    expect(plural("en", 2, en, intlLocaleOf("en"))).toBe("2 friends joined");
    expect(plural("en", 1250, en, intlLocaleOf("en"))).toBe("1,250 friends joined");
  });

  it("uses all six Arabic forms with Arabic-Indic digits", () => {
    const say = (n: number) => plural("ar", n, ar, intlLocaleOf("ar"));
    expect(say(0)).toBe("لم ينضم أي صديق بعد");
    expect(say(1)).toBe("انضم صديق واحد");
    expect(say(2)).toBe("انضم صديقان");
    expect(say(3)).toBe("انضم ٣ أصدقاء");
    expect(say(10)).toBe("انضم ١٠ أصدقاء");
    expect(say(11)).toBe("انضم ١١ صديقًا");
    expect(say(99)).toBe("انضم ٩٩ صديقًا");
    expect(say(100)).toBe("انضم ١٠٠ صديق");
  });
});

describe("normalizeReferralCode()", () => {
  it("accepts and uppercases valid codes", () => {
    expect(normalizeReferralCode(" ab12cd34 ")).toBe("AB12CD34");
  });

  it("rejects anything else", () => {
    for (const value of [null, undefined, 42, "", "ABC", "AB12CD345", "AB12-D34", "../../etc"]) {
      expect(normalizeReferralCode(value)).toBeNull();
    }
  });
});
