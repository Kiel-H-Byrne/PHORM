import { ProfileSchema, normalizeExperience } from "../schemas";

const base = { firstName: "A", lastName: "B", contact: {} };

describe("ProfileSchema", () => {
  it.each(["entry", "intermediate", "expert"])(
    "accepts every experience level the dropdown offers (%s)",
    (level) => {
      const r = ProfileSchema.safeParse({ ...base, experienceLevel: level });
      expect(r.success && r.data.experienceLevel).toBe(level);
    }
  );

  it("treats the blank dropdown option as not set", () => {
    const r = ProfileSchema.safeParse({ ...base, experienceLevel: "" });
    expect(r.success && r.data.experienceLevel).toBeUndefined();
  });

  it("maps legacy saved values", () => {
    expect(normalizeExperience("apprentice")).toBe("entry");
    expect(normalizeExperience("master")).toBe("expert");
    expect(normalizeExperience("bogus")).toBeUndefined();
    const r = ProfileSchema.safeParse({ ...base, experienceLevel: "master" });
    expect(r.success && r.data.experienceLevel).toBe("expert");
  });

  it("allows a blank class year (NaN from the number input)", () => {
    const r = ProfileSchema.safeParse({ ...base, classYear: NaN });
    expect(r.success && r.data.classYear).toBeUndefined();
  });

  it("rejects implausible class years", () => {
    expect(ProfileSchema.safeParse({ ...base, classYear: 1800 }).success).toBe(
      false
    );
    expect(ProfileSchema.safeParse({ ...base, classYear: 2010 }).success).toBe(
      true
    );
  });
});
