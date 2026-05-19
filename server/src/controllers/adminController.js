/**
 * Admin Controller
 * ------------------
 * Provides platform-wide analytics for admin users.
 *
 * ENDPOINTS:
 *   GET /api/admin/stats — Get platform statistics (admin only)
 */

const { User, Resume, Analysis } = require('../models');
const { sequelize } = require('../config/db');
const logger = require('../utils/logger');

/**
 * GET /api/admin/stats
 * Returns platform-wide statistics for the admin dashboard.
 */
const getStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.count();
    const totalResumes = await Resume.count();
    const totalAnalyses = await Analysis.count();

    // Average ATS score
    const avgResult = await Analysis.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('ats_score')), 'avgScore']],
      raw: true,
    });
    const averageScore = Math.round(avgResult.avgScore || 0);

    // Score distribution (for charts)
    const scoreRanges = await Promise.all([
      Analysis.count({ where: sequelize.where(sequelize.col('ats_score'), '<', 25) }),
      Analysis.count({
        where: {
          ats_score: { [require('sequelize').Op.between]: [25, 49] },
        },
      }),
      Analysis.count({
        where: {
          ats_score: { [require('sequelize').Op.between]: [50, 74] },
        },
      }),
      Analysis.count({
        where: { ats_score: { [require('sequelize').Op.gte]: 75 } },
      }),
    ]);

    // Most common matched skills (aggregate from all analyses)
    const allAnalyses = await Analysis.findAll({
      attributes: ['matched_skills'],
      raw: true,
    });

    const skillCount = {};
    for (const a of allAnalyses) {
      const skills = typeof a.matched_skills === 'string'
        ? JSON.parse(a.matched_skills)
        : a.matched_skills || [];
      for (const skill of skills) {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      }
    }

    // Sort skills by frequency and take top 15
    const topSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    // Recent analyses (last 10)
    const recentAnalyses = await Analysis.findAll({
      include: [
        { model: require('../models/User'), as: 'user', attributes: ['name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'ats_score', 'created_at'],
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalResumes,
        totalAnalyses,
        averageScore,
        scoreDistribution: {
          low: scoreRanges[0],       // 0-24
          moderate: scoreRanges[1],  // 25-49
          good: scoreRanges[2],      // 50-74
          excellent: scoreRanges[3], // 75-100
        },
        topSkills,
        recentAnalyses,
      },
    });
  } catch (error) {
    logger.error('Admin stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats',
    });
  }
};

module.exports = { getStats };
