import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserRole } from "../../common/enums";
import { CompanyProfile } from "./company-profile.entity";
import { StudentProfile } from "./student-profile.entity";
import { UniversityProfile } from "./university-profile.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => CompanyProfile, (profile) => profile.user, { nullable: true })
  companyProfile?: CompanyProfile;

  @OneToOne(() => StudentProfile, (profile) => profile.user, { nullable: true })
  studentProfile?: StudentProfile;

  @OneToOne(() => UniversityProfile, (profile) => profile.user, { nullable: true })
  universityProfile?: UniversityProfile;
}
