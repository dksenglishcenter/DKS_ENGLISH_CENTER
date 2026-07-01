import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; service: string } {
    return {
      message: 'DKS English Center API is running',
      service: 'dks-english-center-backend',
    };
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
