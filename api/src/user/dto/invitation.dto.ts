import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt } from 'class-validator';
import { UserRoleEnum, DepartmentEnum } from 'src/generated/enums';

export class InvitationDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
  @ApiProperty()
  @IsEnum(DepartmentEnum)
  department: DepartmentEnum;
}

export class UpdateInvitationDTO extends PartialType(InvitationDTO) {
  @ApiProperty()
  @IsInt()
  id: number;
}
