import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SubscriptionStatus } from "../../common/enums";
import { Plan } from "./plan.entity";

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn()
  plan: Plan;

  @Column()
  planId: string;

  @Column({ type: "enum", enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVA })
  status: SubscriptionStatus;

  @CreateDateColumn()
  startedAt: Date;
}
