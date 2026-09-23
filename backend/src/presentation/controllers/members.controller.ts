import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMembersUseCase } from '../../application/use-cases/check-members/get-members.use-case';
import { MemberPresentationDto } from '../dtos/api-response.dto';

@ApiTags('Members')
@Controller('api/members')
export class MembersController {
  constructor(private readonly getMembersUseCase: GetMembersUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get all members',
    description:
      'Returns all members and the number of books each is currently borrowing.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of members retrieved successfully',
    type: [MemberPresentationDto],
  })
  async getAllMembers(): Promise<MemberPresentationDto[]> {
    return this.getMembersUseCase.execute();
  }
}
