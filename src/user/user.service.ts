import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { userRegisterDto } from './dto/user-register.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import type { PayloadInterface } from './interfaces/payload.interface';

// Coût bcrypt. 10 est le défaut de la bibliothèque ; l'augmenter ralentit
// volontairement la vérification, donc aussi une attaque par force brute.
const SALT_ROUNDS = 12;

// MySQL signale une violation d'unicité par ER_DUP_ENTRY (errno 1062).
function isDuplicateEntryError(error: unknown): boolean {
  const driverError = (error as QueryFailedError)?.driverError as
    { code?: string; errno?: number } | undefined;
  return driverError?.code === 'ER_DUP_ENTRY' || driverError?.errno === 1062;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(userData: userRegisterDto): Promise<Partial<UserEntity>> {
    const user = this.userRepository.create({
      ...userData,
    });
    // bcrypt.hash génère son propre sel et l'embarque dans le hash renvoyé :
    // c'est ce hash que bcrypt.compare relit à la connexion.
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    try {
      await this.userRepository.save(user);
    } catch (error) {
      // Ne convertir en 409 que la violation de contrainte d'unicité. Le catch
      // était auparavant inconditionnel : une table manquante ou une connexion
      // perdue ressortait en « email ou username already exist », ce qui envoie
      // le diagnostic dans la mauvaise direction.
      if (isDuplicateEntryError(error)) {
        throw new ConflictException('email ou username already exist');
      }
      throw error;
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async login(credentials: LoginCredentialsDto): Promise<{ access_token: string }> {
    //on recupere le username et le password de l'utilisateur
    const { username, password } = credentials;
    //on peut se logger soit avec le username soit avec l'email
    //verifier s'il un user avec ce username ou password existe
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username or user.email = :username', {
        username,
      })
      .getOne();
    // Si l'utilisateur n'existe pas, on retourne 401 (et non 404 pour ne pas révéler d'infos)
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    // bcrypt.compare fait une comparaison à temps constant : pas de fuite par timing
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    // Typé : ajouter un champ au JWT sans l'ajouter au type ne compile plus,
    // et inversement la stratégie ne peut pas lire un champ jamais signé.
    const payload: PayloadInterface = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
