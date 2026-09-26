import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("university_profiles")
export class UniversityProfile {
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
  location: string;

  @Column({ type: "text", default: "" })
  description: string;

  @Column({ nullable: true })
  logoPath?: string;
}
