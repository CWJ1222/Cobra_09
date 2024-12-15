const models = require('../models/index');
const { errorlogs } = require('../utils/common');

const { Op } = require('sequelize');
/*

	•	Op.eq : Equal (같음)
	•	Op.ne : Not Equal (다름)
	•	Op.gt : Greater Than (크다)
	•	Op.gte : Greater Than or Equal (크거나 같다)
	•	Op.lt : Less Than (작다)
	•	Op.lte : Less Than or Equal (작거나 같다)

*/

exports.main = (req, res) => {
  res.render('index');
};

exports.getVisitors = (req, res) => {
  models.Visitor.findAll()
    .then((result) => {
      console.log('findAll>>', result);

      res.render('visitors', { data: result });
    })
    .catch((err) => {
      console.log('getVisitors Controller Err', err);
      res.status(500).send('server err!');
    });
};

exports.getVisitor = async (req, res) => {
  try {
    const result = await models.Visitor.findOne({
      where: {
        id: req.params.id,
      },
    });
    console.log('findOne >> ', result);
    res.send(result);
  } catch (err) {
    console.log('err', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postVisitor = (req, res) => {
  models.Visitor.create({
    name: req.body.name,
    comment: req.body.comment,
  })
    .then((result) => {
      console.log(result);

      res.send(result);
    })
    .catch((err) => {
      errorlogs(res, err);
    });
};

exports.deleteVisitor = async (req, res) => {
  try {
    const result = await models.Visitor.destroy({
      where: { id: req.body.id },
    });
    console.log(result);

    if (Boolean(result)) {
      res.send(req.body.id + '번 id 삭제완료');
    } else {
      res.send('잘못된 접근입니다!!');
    }
  } catch (err) {
    errorlogs(res, err);
  }
};

exports.patchVisitor = async (req, res) => {
  try {
    const [result] = await models.Visitor.update(
      {
        name: req.body.name,
        comment: req.body.comment,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    console.log(result);

    if (Boolean(result)) {
      res.send('수정 완료');
    } else {
      res.send('잘못된 접근입니다.');
    }
  } catch (err) {
    errorlogs(res, err, 'patch controller 내부');
  }
};
