import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../../common/enums";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @Column()
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "int" })
  priceArs: number;

  // null = sin límite
  @Column({ type: "int", nullable: true })
  maxActiveOffers: number | null;

  // solo aplica a planes de universidad
  @Column({ type: "int", nullable: true })
  maxVisibleOffers: number | null;

  @Column({ type: "int", default: 0 })
  sortOrder: number;
}
