import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BorrowRequestDto {
  @ApiProperty({
    description: 'Unique member code',
    example: 'M001',
  })
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @ApiProperty({
    description: 'Unique book code to borrow',
    example: 'JK-45',
  })
  @IsString()
  @IsNotEmpty()
  bookCode: string;
}
