import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

//   async register(email: string, password: string, householdName: string) {
//     const exists = await this.prisma.appUser.findUnique({ where: { email } });
//     if (exists) throw new UnauthorizedException('Email già registrata');

//     const passwordHash = await bcrypt.hash(password, 10);
//     const user = await this.prisma.appUser.create({
//       data: { email, passwordHash },
//     });

//     const household = await this.prisma.household.create({
//       data: { name: householdName, ownerId: user.id },
//     });

//     // crea profilo admin adulto
//     await this.prisma.profile.create({
//       data: {
//         householdId: household.id,
//         displayName: 'Genitore',
//         type: 'adult',
//         role: 'admin',
//         color: '#6C8CFF',
//       },
//     });

//     return this.sign(user.id, email);
//   }

  async login(email: string, password: string) {
    const user = await this.prisma.appUser.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenziali non valide');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenziali non valide');
    return this.sign(user.id, email);
  }

  private sign(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email });
    return { accessToken };
  }

  async register(email: string, password: string, householdName: string) {
  const exists = await this.prisma.appUser.findUnique({ where: { email } });
  if (exists) throw new UnauthorizedException('Email già registrata');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await this.prisma.appUser.create({
    data: { email, passwordHash },
  });

  const household = await this.prisma.household.create({
    data: { name: householdName, ownerId: user.id },
  });

  // profilo admin adulto di default
  await this.prisma.profile.create({
    data: {
      householdId: household.id,
      displayName: 'Genitore',
      type: 'adult',
      role: 'admin',
      color: '#6C8CFF',
    },
  });

  // RITORNO token + householdId per usarlo subito nelle chiamate
  const accessToken = this.jwt.sign({ sub: user.id, email });
  return { accessToken, householdId: household.id };
}

}
