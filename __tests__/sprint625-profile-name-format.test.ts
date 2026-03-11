/**
 * Sprint 625: Profile photo (already exists) + "First L." name format + firstName/lastName fields
 * CEO feedback: Name should be "First Name + First Letter of Last Name" (e.g., "Rahul P.")
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 625 — Profile Name Format", () => {
  const schemaSrc = readFile("shared/schema.ts");
  const identityCardSrc = readFile("components/profile/ProfileIdentityCard.tsx");
  const editProfileSrc = readFile("app/edit-profile.tsx");
  const routesMembersSrc = readFile("server/routes-members.ts");
  const storageMembersSrc = readFile("server/storage/members.ts");
  const profileSrc = readFile("app/(tabs)/profile.tsx");

  describe("Schema changes", () => {
    it("members table has firstName column", () => {
      expect(schemaSrc).toContain('firstName: text("first_name")');
    });

    it("members table has lastName column", () => {
      expect(schemaSrc).toContain('lastName: text("last_name")');
    });

    it("schema stays under 960 LOC", () => {
      const loc = schemaSrc.split("\n").length;
      expect(loc).toBeLessThan(960);
    });
  });

  describe("ProfileIdentityCard name format", () => {
    it("exports formatShortName function", () => {
      expect(identityCardSrc).toContain("export function formatShortName");
    });

    it("formatShortName handles first + last", () => {
      expect(identityCardSrc).toContain("lastName.charAt(0).toUpperCase()");
    });

    it("interface has firstName prop", () => {
      expect(identityCardSrc).toContain("firstName");
    });

    it("interface has lastName prop", () => {
      expect(identityCardSrc).toContain("lastName");
    });

    it("uses shortName in render", () => {
      expect(identityCardSrc).toContain("{shortName}");
    });
  });

  describe("Edit profile form", () => {
    it("has firstName state", () => {
      expect(editProfileSrc).toContain("firstName");
      expect(editProfileSrc).toContain("setFirstName");
    });

    it("has lastName state", () => {
      expect(editProfileSrc).toContain("lastName");
      expect(editProfileSrc).toContain("setLastName");
    });

    it("has First Name field label", () => {
      expect(editProfileSrc).toContain("First Name");
    });

    it("has Last Name field label", () => {
      expect(editProfileSrc).toContain("Last Name");
    });

    it("shows 'First L.' hint", () => {
      expect(editProfileSrc).toContain("First L.");
    });

    it("sends firstName/lastName in API update", () => {
      expect(editProfileSrc).toContain("firstName: firstName.trim()");
      expect(editProfileSrc).toContain("lastName: lastName.trim()");
    });
  });

  describe("Server-side support", () => {
    it("PUT /api/members/me accepts firstName", () => {
      expect(routesMembersSrc).toContain("firstName");
    });

    it("PUT /api/members/me accepts lastName", () => {
      expect(routesMembersSrc).toContain("lastName");
    });

    it("updateMemberProfile handles firstName", () => {
      expect(storageMembersSrc).toContain("updates.firstName");
    });

    it("updateMemberProfile handles lastName", () => {
      expect(storageMembersSrc).toContain("updates.lastName");
    });
  });

  describe("Profile screen wiring", () => {
    it("passes firstName to ProfileIdentityCard", () => {
      expect(profileSrc).toContain("firstName=");
    });

    it("passes lastName to ProfileIdentityCard", () => {
      expect(profileSrc).toContain("lastName=");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("schema current updated", () => {
      expect(thresholds.files["shared/schema.ts"].current).toBeGreaterThanOrEqual(898);
    });

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 31 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(31);
    });
  });
});
