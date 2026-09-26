import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyProfile } from "../../users/entities/company-profile.entity";
import { OfferModality, OfferStatus, OfferType } from "../../common/enums";

@Entity("offers")
export class Offer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => CompanyProfile, { onDelete: "CASCADE" })
  @JoinColumn()
  company: CompanyProfile;

  @Column()
  companyId: string;

  @Column()
  title: string;

  @Column()
  area: string;

  @Column({ type: "enum", enum: OfferType })
  type: OfferType;

  @Column({ type: "enum", enum: OfferModality })
  modality: OfferModality;

  @Column()
  location: string;

  @Column({ type: "int", default: 1 })
  vacancies: number;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text" })
  requirements: string;

  @Column({ type: "enum", enum: OfferStatus, default: OfferStatus.ACTIVA })
  status: OfferStatus;

  @CreateDateColumn()
  createdAt: Date;
}
