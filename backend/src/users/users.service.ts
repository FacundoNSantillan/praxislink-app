import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CompanyProfile } from "./entities/company-profile.entity";
import { StudentProfile } from "./entities/student-profile.entity";
import { UniversityProfile } from "./entities/university-profile.entity";
import { UserRole } from "../common/enums";
import { RegisterDto } from "../auth/dto/register.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(CompanyProfile) private companyRepo: Repository<CompanyProfile>,
    @InjectRepository(StudentProfile) private studentRepo: Repository<StudentProfile>,
    @InjectRepository(UniversityProfile) private universityRepo: Repository<UniversityProfile>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createWithProfile(email: string, passwordHash: string, dto: RegisterDto): Promise<User> {
    const user = await this.usersRepo.save(this.usersRepo.create({ email, passwordHash, role: dto.role }));

    if (dto.role === UserRole.EMPRESA) {
      await this.companyRepo.save(
        this.companyRepo.create({
          userId: user.id,
          name: dto.name,
          rubro: dto.rubro || "",
          site: dto.site || "",
          size: dto.size || "",
          description: dto.description || "",
        }),
      );
    } else if (dto.role === UserRole.ESTUDIANTE) {
      await this.studentRepo.save(
        this.studentRepo.create({
          userId: user.id,
          name: dto.name,
          university: dto.university || "",
          career: dto.career || "",
          skills: [],
        }),
      );
    } else if (dto.role === UserRole.UNIVERSIDAD) {
      await this.universityRepo.save(
        this.universityRepo.create({
          userId: user.id,
          name: dto.name,
          location: dto.location || "",
        }),
      );
    }

    return user;
  }

  async getCompanyProfile(userId: string) {
    const profile = await this.companyRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException("Perfil de empresa no encontrado.");
    return profile;
  }

  async getStudentProfile(userId: string) {
    const profile = await this.studentRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException("Perfil de estudiante no encontrado.");
    return profile;
  }

  async getUniversityProfile(userId: string) {
    const profile = await this.universityRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException("Perfil de universidad no encontrado.");
    return profile;
  }

  async updateCompanyProfile(userId: string, changes: Partial<CompanyProfile>) {
    await this.companyRepo.update({ userId }, changes);
    return this.getCompanyProfile(userId);
  }

  async updateStudentProfile(userId: string, changes: Partial<StudentProfile>) {
    await this.studentRepo.update({ userId }, changes);
    return this.getStudentProfile(userId);
  }

  async updateUniversityProfile(userId: string, changes: Partial<UniversityProfile>) {
    await this.universityRepo.update({ userId }, changes);
    return this.getUniversityProfile(userId);
  }

  findCompanyById(id: string) {
    return this.companyRepo.findOne({ where: { id } });
  }

  listCompaniesBasic() {
    return this.companyRepo.find({ select: ["id", "name", "rubro"] });
  }

  listUniversitiesBasic() {
    return this.universityRepo.find({ select: ["id", "name", "location"] });
  }
}
