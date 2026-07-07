import { Injectable } from '@nestjs/common';

// Stub only. Real auth-provider integration (JWT verification against the
// chosen provider) is a separate, later, separately approved task.
@Injectable()
export class AuthService {
  validateUser(_token: string): never {
    throw new Error('AuthService.validateUser is not implemented yet.');
  }
}
