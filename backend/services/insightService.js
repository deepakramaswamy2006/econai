exports.generateInsight = (data, prediction) => {

  let insight = `GDP growth is predicted to be ${prediction}%.\n`;

  if (data.inflation < 3)
    insight += "Low inflation supports economic growth. ";

  if (data.unemployment < 5)
    insight += "Strong employment indicates healthy demand. ";

  if (data.debt_to_gdp > 120)
    insight += "High debt levels may create fiscal risks.";

  return insight;
};