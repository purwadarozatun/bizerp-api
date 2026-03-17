import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailService } from './email.service';

@ApiTags('crm/email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/email')
export class EmailController {
  constructor(private readonly email: EmailService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get SMTP configuration status' })
  getConfig() {
    return this.email.getSmtpConfig();
  }

  @Post('send')
  @ApiOperation({ summary: 'Send an email via SMTP' })
  send(@Body() body: { to: string | string[]; subject: string; text?: string; html?: string }) {
    return this.email.send(body);
  }

  @Post('send-to-contact')
  @ApiOperation({ summary: 'Send email to a contact and log as activity' })
  sendToContact(@Body() body: { contactId: string; subject: string; body: string }) {
    return this.email.sendToContact(body.contactId, body.subject, body.body);
  }
}
