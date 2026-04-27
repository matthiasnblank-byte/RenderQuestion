export const questionSets = {
  day1: {
    id: "day1",
    label: "Tag 1",
    questions: [
      {
        text: "Which task was named as part of financial management?",
        options: [
          "Liquidity management",
          "Writing frontend CSS",
          "Producing raw materials",
          "Designing office furniture"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "Which three categories were used to explain reasons for inflation?",
        options: [
          "Supply, demand and monetary reasons",
          "Assets, liabilities and equity",
          "Profit, EBIT and EBITDA",
          "Stocks, bonds and options"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "Which statements were presented as the three major financial statements?",
        options: [
          "Income statement, balance sheet and cashflow statement",
          "Budget, roadmap and mission statement",
          "Rating report, term sheet and stock index",
          "Invoice, receipt and bank contract"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What does a balance sheet show according to the lecture?",
        options: [
          "Where the money comes from and where it is invested",
          "Only the profit of the current year",
          "Only the monthly cash receipts",
          "The market price of all competitors"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "Which stakeholder interest was assigned to banks?",
        options: [
          "Interest rates",
          "Salary payments",
          "Tax compliance",
          "Marketing campaigns"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "How is Return on Sales calculated?",
        options: [
          "Profit divided by revenues",
          "Equity divided by capital",
          "Profit divided by equity",
          "Debt divided by cash"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "How is the Equity Ratio calculated?",
        options: [
          "Equity divided by capital",
          "Profit divided by revenues",
          "Cash divided by sales",
          "Revenue divided by costs"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is EBITDA?",
        options: [
          "Earnings before interest, taxes, depreciation and amortization",
          "Earnings after all taxes and dividends",
          "Cash receipts minus cash expenditures only",
          "Equity before debt and assets"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "Why are static investment approaches called static?",
        options: [
          "They consider only one year or an average year",
          "They always require a stock market price",
          "They use only dynamic interest rates",
          "They ignore all cost information"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What does the Net Present Value method do?",
        options: [
          "Discounts future cashflows to year 0",
          "Compares only one year's average cost",
          "Ignores the timing of payments",
          "Measures only accounting depreciation"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "How was the Internal Rate of Return defined?",
        options: [
          "The interest rate at which the net present value is zero",
          "The interest rate paid on every bank loan",
          "The average profit divided by revenues",
          "The probability that a company defaults"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is the leverage effect in the financing example?",
        options: [
          "Debt can increase return on equity if interest rates are low enough",
          "Debt always lowers return on equity to zero",
          "Equity financing makes bankruptcy impossible",
          "Dividend payments are tax deductible"
        ],
        correctAnswerIndex: 0
      }
    ]
  },
  day2: {
    id: "day2",
    label: "Tag 2",
    questions: [
      {
        text: "Which two components mainly make up a DCF company valuation?",
        options: [
          "Detailed periods and terminal value",
          "Assets and liabilities only",
          "Revenue and marketing budget",
          "Stock price and dividend yield only"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What does the net asset value approach focus on?",
        options: [
          "The current value or sum of the parts",
          "Only future cashflows in eternity",
          "The price of one similar stock index",
          "The probability of default"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is the core idea of shareholder value?",
        options: [
          "Maximizing value for investors through dividends and stock price",
          "Minimizing all financial reporting",
          "Avoiding capital markets completely",
          "Maximizing employee travel costs"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is a stock market index such as DAX, Dow Jones or NASDAQ 100?",
        options: [
          "A weighted average of important stocks",
          "A list of bank loan covenants",
          "A direct replacement for a cashflow statement",
          "A tax rule for dividend payments"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "How was risk described in the capital markets section?",
        options: [
          "Uncertainty about the return",
          "A guaranteed positive return",
          "Only the cost of bookkeeping",
          "The number of shares in an index"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is the message of market efficiency theory?",
        options: [
          "There is no free lunch because public information is already reflected",
          "Experts can always earn sustainable excess returns without risk",
          "Stock prices never react to new information",
          "Only dividends determine a company's value"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What does PER stand for in stock KPIs?",
        options: [
          "Price earning ratio",
          "Profit equity return",
          "Projected expense rate",
          "Public earnings reserve"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is a typical goal of M&A?",
        options: [
          "Creating synergy effects such as entering new regions or acquiring knowledge",
          "Avoiding any change in the company",
          "Eliminating all tax reporting",
          "Replacing financial planning with stock picking"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is bought in an asset deal?",
        options: [
          "Selected or all assets",
          "Only the shares of the target company",
          "Only future dividends",
          "Only the company name"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is the basic idea of natural hedging?",
        options: [
          "Invest where you sell so cost and income structures are comparable",
          "Buy options for every possible market movement",
          "Avoid all foreign revenues",
          "Use only short-term bank debt"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "What is a disadvantage of using a future for hedging?",
        options: [
          "No upside opportunity",
          "The currency risk becomes larger by definition",
          "It cannot be used with currencies",
          "It automatically creates unlimited dividends"
        ],
        correctAnswerIndex: 0
      },
      {
        text: "How is working capital defined in the lecture?",
        options: [
          "Current assets minus current liabilities",
          "Profit minus depreciation",
          "Equity divided by capital",
          "Revenue divided by cash balance"
        ],
        correctAnswerIndex: 0
      }
    ]
  }
};

export const questionDecks = Object.values(questionSets).map(({ id, label, questions }) => ({
  id,
  label,
  totalQuestions: questions.length
}));

export function getQuestionSet(questionSetId = "day1") {
  return questionSets[questionSetId] || questionSets.day1;
}

export const questions = questionSets.day1.questions;
