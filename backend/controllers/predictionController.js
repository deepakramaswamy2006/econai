const Prediction = require("../models/Prediction");
const axios = require("axios");

const {
  predictGDP,
  predictCrisis,
  predictInflation,
  getHistoricalData,
} = require("../services/mlService");


exports.predictGDP = async (req, res) => {
  try {
    const inputData = req.body;
    const prediction = await predictGDP(inputData);
    const record = new Prediction({
      country: inputData.country,
      year: inputData.year,
      predicted_gdp_growth: prediction.predicted_gdp_growth,
      model_used: "XGBoost"
    });
    await record.save();
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.predictCrisis = async (req, res) => {
  try {
    const inputData = req.body;
    const prediction = await predictCrisis(inputData);
    const record = new Prediction({
      country: inputData.country,
      year: inputData.year,
      crisis_probability: prediction.crisis_probability,
      model_used: "XGBoost"
    });
    await record.save();
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.predictInflation = async (req, res) => {
  try {
    const inputData = req.body;
    const prediction = await predictInflation(inputData);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.historicalData = async (req, res) => {
  try {
    const data = await getHistoricalData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getLatestReport = async (req, res) => {
  try {
    // 1. Fetch latest data row (simulating pulling from db or file via python ML service)
    // For this demo, we'll hit an endpoint on the python service that we need to create
    // Or we can just read the file directly since we are on the same machine

    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, '../../ml-service/data/macroeconomic_data.csv');

    // Quick read of last row of CSV
    const data = fs.readFileSync(dataPath, 'utf8');
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    const latestValues = lines[lines.length - 1].split(',');

    let latestData = {};
    headers.forEach((header, index) => {
      latestData[header] = parseFloat(latestValues[index]);
    });

    // 2. Format the payload for the ML predictive models
    const payload = {
      inflation: latestData.inflation,
      unemployment: latestData.unemployment,
      interest_rate: latestData.interest_rate,
      debt_to_gdp: latestData.debt_to_gdp,
    };

    // 3. Get predictions
    const gdpPrediction = await predictGDP(payload);
    const crisisPrediction = await predictCrisis(payload);

    const gdpGrowth = gdpPrediction.predicted_gdp_growth.toFixed(2);
    const crisisProb = (crisisPrediction.crisis_probability * 100).toFixed(2);

    let riskLevel = "Low";
    if (crisisProb > 60) riskLevel = "High";
    else if (crisisProb > 30) riskLevel = "Med";

    // 4. Generate the conversational EconAI Report
    let reportText = `**Current Economic Pulse**: It looks like we're heading toward a ${gdpGrowth > 0 ? "steady" : "slight contraction of"} ${gdpGrowth}% GDP growth rate! Here is what the data is telling me...\n\n`;

    reportText += `**Stability Gauge**: ${crisisProb}% (Risk Level: ${riskLevel}) `;
    if (riskLevel === "High" || riskLevel === "Med") {
      reportText += `🚨\n*Stability Alert! The primary economic levers causing this concern are your Debt-to-GDP ratio (${latestData.debt_to_gdp.toFixed(2)}%) and Interest Rates (${latestData.interest_rate.toFixed(2)}%).*\n\n`;
    } else {
      reportText += `✅\n\n`;
    }

    reportText += `**Deep Dive (The Reasoning)**:\n`;
    reportText += `- **Unemployment (${latestData.unemployment.toFixed(2)}%) & Inflation (${latestData.inflation.toFixed(2)}%)**: These numbers are strongly influencing the GDP forecast.\n`;
    reportText += `- **Debt-to-GDP (${latestData.debt_to_gdp.toFixed(2)}%) & Interest Rates (${latestData.interest_rate.toFixed(2)}%)**: These variables are driving the crisis probability index.\n\n`;

    reportText += `**Interactive Suggestion**: Keep a close eye on the **Interest Rate** in your next dataset update! Monitoring how it impacts overall borrowing costs might be key to alleviating risk!`;

    res.json({
      gdpForecast: gdpGrowth,
      inflationRate: latestData.inflation,
      unemploymentRate: latestData.unemployment,
      riskIndex: crisisProb,
      report: reportText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in getLatestReport:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getExplanation = async (req, res) => {
  try {
    const { context, predictionData, newsQuery } = req.body;

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.json({ explanation: "Groq API key is missing. Please add it to your .env file to enable AI explanations." });
    }

    // Step 1: Optionally fetch related news headlines to enrich the explanation
    let newsContext = "";
    if (newsQuery && process.env.NEWSDATA_API_KEY && process.env.NEWSDATA_API_KEY !== 'your_newsdata_api_key_here') {
      try {
        const newsUrl = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(newsQuery)}&language=en&category=business`;
        const newsRes = await axios.get(newsUrl);
        const articles = (newsRes.data.results || []).slice(0, 5);
        if (articles.length > 0) {
          const headlines = articles.map((a, i) => `${i + 1}. "${a.title}" (${a.source_id || 'News'})`).join("\n");
          newsContext = `\n\nRelevant News Headlines (use these to enrich and ground your explanation with real-world context):\n${headlines}`;
        }
      } catch (newsErr) {
        // Silently skip news enrichment on rate limit — not a fatal error
        if (newsErr?.response?.status !== 429) {
          console.warn("Could not fetch news for explanation enrichment:", newsErr.message);
        }
      }
    }

    // Step 2: Short, focused prompt — 2-3 sentences max
    const userPrompt = `
Prediction: ${context}
Data: ${JSON.stringify(predictionData)}
${newsContext}

In 2-3 sentences, explain simply WHY this prediction result occurred based on the input indicators. Be direct and specific. No generic phrases.`.trim();

    // Step 3: Call Groq
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a senior economic research analyst at a global financial institution. You synthesize macroeconomic model outputs with real-world news to produce clear, actionable, expert-level reports. Write in a professional but accessible tone. Be specific and reference numbers from the data.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const explanation = response.data.choices[0].message.content;
    res.json({ explanation });
  } catch (error) {
    const status = error?.response?.status;
    const groqErr = error?.response?.data?.error;

    if (status === 429) {
      // Groq daily token limit hit — return a clean fallback, not a 500
      const retryMsg = groqErr?.message?.match(/try again in ([^.]+)/i)?.[1];
      return res.json({
        explanation: `⚠️ AI explanation is temporarily unavailable — the daily Groq API token limit has been reached.${retryMsg ? ` Please try again in ${retryMsg}.` : ' Please try again later.'
          } The ML prediction above is still fully accurate.`,
        rateLimited: true,
      });
    }

    console.error("Error in getExplanation:", groqErr || error.message);
    res.status(500).json({ error: "Failed to generate AI explanation." });
  }
};

exports.getNews = async (req, res) => {
  try {
    const { query } = req.query;

    if (!process.env.NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY === 'your_newsdata_api_key_here') {
      return res.json({ articles: [], error: "NewsData API key is missing. Please add it to your .env file." });
    }

    const searchQuery = query || "economy";
    const apiKey = process.env.NEWSDATA_API_KEY;
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(searchQuery)}&language=en&category=business`;

    const response = await axios.get(url);
    const articles = response.data.results || [];

    // Deduplicate: remove articles with same title or article_id
    const seen = new Set();
    const unique = articles.filter((a) => {
      const key = (a.article_id || a.title || "").toLowerCase().slice(0, 60);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Return top 4 unique articles with only needed fields
    const clean = unique.slice(0, 4).map((a) => ({
      article_id: a.article_id,
      title: a.title,
      description: a.description ? a.description.split(".")[0] + "." : null, // first sentence only
      link: a.link,
      source_id: a.source_id,
      pubDate: a.pubDate,
    }));

    res.json({ articles: clean });
  } catch (error) {
    if (error?.response?.status === 429) {
      // Silently return empty articles on rate limit — not a fatal error
      return res.json({ articles: [], rateLimited: true });
    }
    console.error("Error fetching news:", error.message);
    res.status(500).json({ error: "Failed to fetch top news." });
  }
};