import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE } from '../../database/database.module.js';
import * as schema from '../../database/schema.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
  }) {
    const existingUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const slug = this.slugify(dto.companyName);

    const existingCompany = await this.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.slug, slug))
      .limit(1);

    if (existingCompany.length > 0) {
      throw new ConflictException('Company name already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [company] = await this.db
      .insert(schema.companies)
      .values({
        name: dto.companyName,
        slug,
      })
      .returning();

    const [user] = await this.db
      .insert(schema.users)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        companyId: company.id,
        role: 'owner',
      })
      .returning();

    const token = await this.generateToken(user, company.id);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: company.id,
      },
    };
  }

  async login(dto: { email: string; password: string }) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(user, user.companyId);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async getProfile(userId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const [company] = await this.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, user.companyId))
      .limit(1);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: user.emailVerified,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        plan: company.plan,
      },
    };
  }

  private async generateToken(
    user: { id: string; email: string; role: string },
    companyId: string,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      companyId,
      role: user.role,
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }
}
