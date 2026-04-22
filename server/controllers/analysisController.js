const FIR = require('../models/FIR');

/**
 * GET /api/analysis/fir/:id
 * Smart analysis for a specific FIR
 */
exports.analyzeFIR = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: 'FIR not found'
      });
    }

    // 1. Similar Case Matching
    const similarCases = await FIR.find({
      _id: { $ne: fir._id },
      $or: [
        { crimeType: fir.crimeType, district: fir.district },
        { location: { $regex: fir.location, $options: 'i' } }
      ]
    });

    // 2. Pattern Insight
    let patternInsight = "This type of crime usually occurs in ";
    if (fir.crimeType.toLowerCase().includes('theft') || fir.crimeType.toLowerCase().includes('robbery')) {
      patternInsight += "low-traffic areas with limited surveillance.";
    } else if (fir.crimeType.toLowerCase().includes('assault')) {
      patternInsight += "areas with high social density during late hours.";
    } else {
      patternInsight += "isolated spots near major transit points.";
    }

    if (similarCases.length > 5) {
      patternInsight = "Repeated incidents found in this location. " + patternInsight;
    }

    // 3. Execution Method Prediction
    let executionMethod = "";
    const methods = {
      'Theft': "Entry through forced window access; method involves silent tools; escape likely via narrow lanes.",
      'Robbery': "Entry via target interception; method involves intimidation; escape quickly using a two-wheeler.",
      'Burglary': "Entry via rear door; method involves lock picking; escape via residential back-alleys.",
      'Snatching': "Method: Quick snatching from moving target; escape: high-speed bike via main road junctions."
    };
    executionMethod = methods[fir.crimeType] || "Calculated approach targeting vulnerable points; quick execution; planned escape route.";

    // 4. Predicted Time Range
    let predictedTime = "8PM - 11PM";
    if (similarCases.length > 0) {
      const hours = similarCases.map(c => new Date(c.date).getHours());
      const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
      const formatTime = (h) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}${period}`;
      };
      predictedTime = `${formatTime((avgHour - 1 + 24) % 24)} - ${formatTime((avgHour + 2) % 24)}`;
    }

    // 5. Risk Level
    let riskLevel = "Low";
    if (similarCases.length > 10) riskLevel = "High";
    else if (similarCases.length > 3) riskLevel = "Medium";

    res.status(200).json({
      success: true,
      analysis: {
        similarCases: similarCases.length,
        patternInsight,
        executionMethod,
        predictedTime,
        riskLevel,
        investigationHint: `Check CCTV near major road junctions in ${fir.district}. Monitor repeated areas during the predicted time window.`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Analysis failed',
      error: error.message
    });
  }
};

/**
 * GET /api/analysis/dashboard
 * Dashboard analytics - aggregate statistics
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalFIRs = await FIR.countDocuments();
    const [pendingCount, investigatingCount, closedCount] = await Promise.all([
      FIR.countDocuments({ status: 'Pending' }),
      FIR.countDocuments({ status: 'Investigating' }),
      FIR.countDocuments({ status: 'Closed' })
    ]);

    const crimeTypeDistribution = await FIR.aggregate([
      { $group: { _id: '$crimeType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await FIR.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));

    const recentFIRs = await FIR.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title crimeType location status date inspectorName district');

    res.status(200).json({
      success: true,
      analytics: {
        totalFIRs,
        statusBreakdown: {
          pending: pendingCount,
          investigating: investigatingCount,
          closed: closedCount
        },
        crimeTypeDistribution: crimeTypeDistribution.map(item => ({
          type: item._id,
          count: item.count
        })),
        monthlyTrend: formattedMonthlyTrend,
        recentFIRs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * POST /api/analysis/ai-crime-analysis
 * New Feature: AI CRIME ANALYSIS
 * Triggered after FIR registration
 */
exports.getAICrimeAnalysis = async (req, res) => {
  try {
    const { crimeType, location, district, description, date } = req.body;

    // A. SIMILAR CASE MATCHING
    // Compare based on crimeType, district, and description similarity (keywords)
    const keywords = description.toLowerCase().split(' ').filter(w => w.length > 4);
    
    const similarCases = await FIR.find({
      $or: [
        { crimeType, district },
        { crimeType, location: { $regex: location, $options: 'i' } },
        { description: { $regex: keywords.slice(0, 3).join('|'), $options: 'i' } }
      ],
      _id: { $ne: req.body.firId }
    }).limit(50);

    const similarCount = similarCases.length;

    // B. CRIME PATTERN EXPLANATION
    let patternInsight = "";
    if (similarCount > 5) {
      patternInsight = `Repeated incidents found in this location. This type of crime usually occurs in low-traffic areas.`;
    } else if (similarCount > 0) {
      patternInsight = `Similar patterns detected in ${district}. Investigation suggests selective targeting of vulnerable spots.`;
    } else {
      patternInsight = `First recorded incident of this pattern in ${district}. Likely an emerging or stray incident.`;
    }

    // C. CRIME EXECUTION INSIGHT
    let executionMethod = "";
    const lowerDesc = description.toLowerCase();
    const lowerType = crimeType.toLowerCase();

    if (lowerType.includes('theft') || lowerType.includes('burglary')) {
      if (lowerDesc.includes('window') || lowerDesc.includes('break')) {
        executionMethod = "Entry via forced window/door access using silent tools. Suspect likely targeted isolated property.";
      } else {
        executionMethod = "Unauthorized entry through unsecured points. Suspect may have monitored the location beforehand.";
      }
    } else if (lowerType.includes('robbery') || lowerType.includes('snatching')) {
      executionMethod = "Target intercepted in motion. Suspect may have used a two-wheeler for a quick escape via main roads.";
    } else if (lowerType.includes('assault')) {
      executionMethod = "Direct confrontation in low-visibility area. Suspect likely targeted isolated individual.";
    } else {
      executionMethod = "Calculated approach with specific tools. Method indicates potential pre-planned execution and escape.";
    }

    // D. TIME ANALYSIS
    let predictedTime = "8PM - 11PM"; // Default
    if (similarCount > 0) {
      const hours = similarCases.map(c => new Date(c.date).getHours());
      const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
      const formatTime = (h) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}${period}`;
      };
      predictedTime = `${formatTime((avgHour - 1 + 24) % 24)} - ${formatTime((avgHour + 2) % 24)}`;
    }

    // E. RISK LEVEL
    let riskLevel = "Low";
    if (similarCount > 10) riskLevel = "High";
    else if (similarCount > 3) riskLevel = "Medium";

    // F. INVESTIGATION SUGGESTION
    let investigationHint = "Check CCTV near ";
    if (lowerDesc.includes('bike') || lowerDesc.includes('vehicle')) {
      investigationHint += "main road junctions and fuel stations. ";
    } else {
      investigationHint += "nearby commercial establishments. ";
    }
    investigationHint += `Monitor repeated areas in ${district} during the predicted hours.`;

    res.status(200).json({
      success: true,
      analysis: {
        similarCases: similarCount,
        patternInsight,
        executionMethod,
        predictedTime,
        riskLevel,
        investigationHint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI Analysis failed',
      error: error.message
    });
  }
};

