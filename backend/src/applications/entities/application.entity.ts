import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Offer } from "../../offers/entities/offer.entity";
import { StudentProfile } from "../../users/entities/student-profile.entity";
import { ApplicationStatus } from "../../common/enums";

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Offer, { onDelete: "CASCADE" })
  @JoinColumn()
  offer: Offer;

  @Column()
  offerId: string;

  @ManyToOne(() => StudentProfile, { eager: true, onDelete: "CASCADE" })
  @JoinColumn()
  student: StudentProfile;

  @Column()
  studentId: string;

  @Column({ type: "text", default: "" })
  message: string;

  @Column({ type: "int" })
  matchScore: number;

  // Palabras del CV / habilidades que efectivamente coincidieron con la oferta,
  // para poder mostrarle a la empresa por qué se calculó ese puntaje.
  @Column({ type: "simple-array", default: "" })
  matchedKeywords: string[];

  @Column({ type: "enum", enum: ApplicationStatus, default: ApplicationStatus.NUEVO })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;
}
