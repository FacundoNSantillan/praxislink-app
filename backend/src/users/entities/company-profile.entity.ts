import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("company_profiles")
export class CompanyProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ default: "" })
  rubro: string;

  @Column({ default: "" })
  site: string;

  @Column({ default: "" })
  size: string;

  @Column({ type: "text", default: "" })
  description: string;

  @Column({ nullable: true })
  logoPath?: string;
}
