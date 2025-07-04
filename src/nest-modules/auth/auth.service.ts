import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(email: string, _password: string) {
    const payload = { email, name: 'john' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
