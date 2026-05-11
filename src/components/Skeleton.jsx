import React from 'react'
import styles from './Skeleton.module.css'

export function CardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div className={`${styles.bone} ${styles.id}`} />
        <div className={`${styles.bone} ${styles.sev}`} />
        <div className={`${styles.bone} ${styles.score}`} />
      </div>
      <div className={`${styles.bone} ${styles.line1}`} />
      <div className={`${styles.bone} ${styles.line2}`} />
      <div className={styles.row}>
        <div className={`${styles.bone} ${styles.tag}`} />
        <div className={`${styles.bone} ${styles.tag}`} />
        <div className={`${styles.bone} ${styles.date}`} />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  )
}
