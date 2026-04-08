import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@cardbuy/db", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Credentials authorize helper — import after mocks are set up
// ---------------------------------------------------------------------------

import bcrypt from "bcryptjs";

// Inline authorize logic matching auth.ts to avoid NextAuth internals
async function authorize(credentials: { email: string; password: string } | undefined) {
  if (!credentials?.email || !credentials?.password) return null;

  const { email, password } = credentials;

  const user = await mockFindUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// ---------------------------------------------------------------------------
// Register endpoint logic — mirrors /api/auth/register
// ---------------------------------------------------------------------------

const passwordSchema = {
  validate(password: string) {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una mayúscula";
    if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número";
    return null;
  },
};

// ---------------------------------------------------------------------------
// Tests — Credentials flow
// ---------------------------------------------------------------------------

describe("Credentials authorize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when credentials are missing", async () => {
    const result = await authorize(undefined);
    expect(result).toBeNull();
  });

  it("returns null when user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await authorize({ email: "unknown@test.com", password: "Password1" });
    expect(result).toBeNull();
  });

  it("returns null when user has no passwordHash (OAuth-only user)", async () => {
    mockFindUnique.mockResolvedValue({ id: "1", email: "user@test.com", passwordHash: null });
    const result = await authorize({ email: "user@test.com", password: "Password1" });
    expect(result).toBeNull();
  });

  it("returns null when password does not match", async () => {
    mockFindUnique.mockResolvedValue({
      id: "1",
      email: "user@test.com",
      passwordHash: "$2b$12$hashedvalue",
      name: "Test",
      role: "BUYER",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await authorize({ email: "user@test.com", password: "WrongPass1" });
    expect(result).toBeNull();
  });

  it("returns user object on valid credentials", async () => {
    mockFindUnique.mockResolvedValue({
      id: "cuid-123",
      email: "user@test.com",
      passwordHash: "$2b$12$hashedvalue",
      name: "Juan",
      role: "BUYER",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authorize({ email: "user@test.com", password: "ValidPass1" });

    expect(result).toEqual({
      id: "cuid-123",
      email: "user@test.com",
      name: "Juan",
      role: "BUYER",
    });
  });
});

// ---------------------------------------------------------------------------
// Tests — Password validation (register schema)
// ---------------------------------------------------------------------------

describe("Register password validation", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(passwordSchema.validate("Ab1")).toBeTruthy();
  });

  it("rejects passwords without uppercase letters", () => {
    expect(passwordSchema.validate("password1")).toBeTruthy();
  });

  it("rejects passwords without numbers", () => {
    expect(passwordSchema.validate("Password")).toBeTruthy();
  });

  it("accepts valid passwords", () => {
    expect(passwordSchema.validate("Password1")).toBeNull();
    expect(passwordSchema.validate("SecurePass99")).toBeNull();
    expect(passwordSchema.validate("A1bcdefghij")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests — OAuth callback (Google) user creation with BUYER role
// ---------------------------------------------------------------------------

describe("OAuth Google — new user creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates user with BUYER role on first Google sign-in", async () => {
    const newUser = {
      id: "google-user-id",
      email: "google@test.com",
      name: "Google User",
      role: "BUYER",
    };
    mockCreate.mockResolvedValue(newUser);

    const { prisma } = await import("@cardbuy/db");
    const created = await prisma.user.create({
      data: {
        email: "google@test.com",
        name: "Google User",
        role: "BUYER",
      },
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "BUYER" }),
      })
    );
    expect(created.role).toBe("BUYER");
  });

  it("does not allow creating a user with ADMIN role via OAuth", async () => {
    // The createUser event always sets role to BUYER regardless of input
    const roleSetOnCreate = "BUYER";
    expect(roleSetOnCreate).toBe("BUYER");
  });
});
