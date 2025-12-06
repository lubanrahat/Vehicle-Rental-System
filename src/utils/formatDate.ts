const formatDate = (value: string): string => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (regex.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default formatDate;