import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReturnRequestDto {
  @ApiProperty({
    description: 'Unique member code returning the book',
    example: 'M001',
  })
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @ApiProperty({
    description: 'Unique book code being returned',
    example: 'JK-45',
  })
  @IsString()
  @IsNotEmpty()
  bookCode: string;
}
