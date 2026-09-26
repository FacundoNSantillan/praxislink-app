import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("student_profiles")
export class StudentProfile {
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
  university: string;

  @Column({ default: "" })
  career: string;

  @Column({ default: "" })
  year: string;

  @Column({ default: "" })
  location: string;

  @Column({ default: "PPS / Part-time" })
  availability: string;

  @Column({ type: "simple-array", default: "" })
  skills: string[];

  @Column({ nullable: true })
  avatarPath?: string;

  @Column({ nullable: true })
  cvPath?: string;

  @Column({ nullable: true })
  cvOriginalName?: string;

  // Palabras clave detectadas automáticamente al procesar el PDF del CV.
  @Column({ type: "simple-array", default: "" })
  cvKeywords: string[];
}
