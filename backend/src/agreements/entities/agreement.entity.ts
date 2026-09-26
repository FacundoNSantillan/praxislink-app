import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UniversityProfile } from "../../users/entities/university-profile.entity";
import { CompanyProfile } from "../../users/entities/company-profile.entity";
import { AgreementStatus } from "../../common/enums";

@Entity("agreements")
export class Agreement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UniversityProfile, { onDelete: "CASCADE" })
  @JoinColumn()
  university: UniversityProfile;

  @Column()
  universityId: string;

  @ManyToOne(() => CompanyProfile, { eager: true, onDelete: "CASCADE" })
  @JoinColumn()
  company: CompanyProfile;

  @Column()
  companyId: string;

  @Column()
  type: string;

  @Column({ type: "enum", enum: AgreementStatus, default: AgreementStatus.PENDIENTE_FIRMA })
  status: AgreementStatus;

  @CreateDateColumn()
  signedAt: Date;
}
