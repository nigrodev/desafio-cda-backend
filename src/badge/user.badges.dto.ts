import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserBadgesParams {
  @IsNotEmpty()
  @ApiProperty({
    description: 'O steamid do usuário.',
    required: true,
    type: String,
  })
  steamid: string;
}

export class PrettyBadgeList {
  @ApiProperty({
    required: true,
    description: 'O ID do emblema',
  })
  id: number;
  @ApiProperty({
    required: true,
    description: 'O slug do emblema',
  })
  slug: string;
  @ApiProperty({
    required: true,
    description: 'O nome do emblema',
  })
  name: string;
  @ApiProperty({
    required: true,
    description: 'A descrição do emblema',
  })
  image: string;
  @ApiProperty({
    required: true,
    description: 'A data que o usuário adquiriu o emblema.',
  })
  acquiredAt?: Date;
}

export class UserBadgeList {
  @ApiProperty({
    required: true,
    description: 'O steamid do usuário.',
  })
  steamid: string;
  @ApiProperty({
    type: [PrettyBadgeList],
    required: true,
    description: 'Os emblemas do usuário.',
  })
  badges: PrettyBadgeList[];
}
