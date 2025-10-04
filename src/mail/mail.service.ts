import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private log = new Logger(MailService.name);

  async send(to: string, subject: string, text: string) {
    this.log.log(`Mail -> ${to} | ${subject} | ${text}`);
    return true;
  }
}
