import styles from './spinner.module.css'

export const Spinner = () => {
  return (
    <div className={styles.spinner}>
      <div/><div/><div/>&#8203;
    </div>
  );
};

export default Spinner;
