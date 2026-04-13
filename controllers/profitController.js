const Order = require("../models/Order");
const ProfitEntry = require("../models/ProfitEntry");

const parseAmount = (value) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

const buildProfitSummary = async () => {
  const [completedOrders, entryTotals] = await Promise.all([
    Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    ProfitEntry.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const orderIncome = completedOrders[0]?.total || 0;
  const manualIncome =
    entryTotals.find((entry) => entry._id === "income")?.total || 0;
  const totalExpense =
    entryTotals.find((entry) => entry._id === "expense")?.total || 0;
  const totalIncome = orderIncome + manualIncome;
  const netProfit = totalIncome - totalExpense;

  return {
    orderIncome,
    manualIncome,
    totalIncome,
    totalExpense,
    netProfit,
  };
};

const getProfitSummary = async (req, res) => {
  try {
    const [summary, recentEntries] = await Promise.all([
      buildProfitSummary(),
      ProfitEntry.find().sort({ date: -1, createdAt: -1 }).limit(50),
    ]);

    res.status(200).json({
      ...summary,
      entries: recentEntries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfitEntries = async (req, res) => {
  try {
    const entries = await ProfitEntry.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProfitEntry = async (req, res) => {
  try {
    const { type, title, amount, date, note } = req.body;

    if (!type || !title) {
      return res
        .status(400)
        .json({ message: "Type and title are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid entry type" });
    }

    const parsedAmount = parseAmount(amount);

    if (parsedAmount === null) {
      return res
        .status(400)
        .json({ message: "Amount must be a valid non-negative number" });
    }

    const entry = await ProfitEntry.create({
      type,
      title,
      amount: parsedAmount,
      date: date || Date.now(),
      note: note || "",
    });

    res.status(201).json({
      message: "Entry created successfully",
      entry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfitEntry = async (req, res) => {
  try {
    const { type, title, amount, date, note } = req.body;
    const entry = await ProfitEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "Invalid entry type" });
      }

      entry.type = type;
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }

      entry.title = title;
    }

    if (amount !== undefined) {
      const parsedAmount = parseAmount(amount);

      if (parsedAmount === null) {
        return res
          .status(400)
          .json({ message: "Amount must be a valid non-negative number" });
      }

      entry.amount = parsedAmount;
    }

    if (date !== undefined) {
      entry.date = date;
    }

    if (note !== undefined) {
      entry.note = note;
    }

    const updatedEntry = await entry.save();

    res.status(200).json({
      message: "Entry updated successfully",
      entry: updatedEntry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProfitEntry = async (req, res) => {
  try {
    const entry = await ProfitEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await entry.deleteOne();

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfitSummary,
  getProfitEntries,
  createProfitEntry,
  updateProfitEntry,
  deleteProfitEntry,
};