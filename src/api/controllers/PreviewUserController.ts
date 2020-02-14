import { JsonController, Get, OnUndefined, Param, Post, Put, Body, Authorized, Delete } from 'routing-controllers';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { SERVER_ERROR } from 'ees_types';
import { PreviewUserService } from '../services/PreviewUserService';
import { PreviewUser } from '../models/PreviewUser';
import { Validator } from 'class-validator';

const validator = new Validator();

/**
 * @swagger
 * definitions:
 *   PreviewUser:
 *     required:
 *       - id
 *       - group
 *     properties:
 *       id:
 *         type: string
 *       group:
 *         type: object
 */

/**
 * @swagger
 * tags:
 *   - name: Preview Users
 *     description: CRUD operations related to users
 */

@Authorized()
@JsonController('/previewusers')
export class UserController {
  constructor(public previewUserService: PreviewUserService) {}

  /**
   * @swagger
   * /previewusers:
   *    get:
   *       description: Get all the users
   *       tags:
   *         - Preview Users
   *       responses:
   *          '200':
   *            description: Successful
   */
  @Get()
  public find(): Promise<PreviewUser[]> {
    return this.previewUserService.find();
  }

  /**
   * @swagger
   * /previewusers/{id}:
   *    get:
   *       description: Get user by id
   *       parameters:
   *         - in: path
   *           name: id
   *           required: true
   *           schema:
   *             type: string
   *           description: user Id
   *       tags:
   *         - Preview Users
   *       produces:
   *         - application/json
   *       responses:
   *          '200':
   *            description: Get user By Id
   *          '404':
   *            description: user not found
   */
  @Get('/:id')
  @OnUndefined(UserNotFoundError)
  public one(@Param('id') id: string): Promise<PreviewUser | undefined> {
    if (!validator.isString(id)) {
      return Promise.reject(
        new Error(
          JSON.stringify({ type: SERVER_ERROR.INCORRECT_PARAM_FORMAT, message: ' : id should be of type string.' })
        )
      );
    }
    return this.previewUserService.findOne(id);
  }

  /**
   * @swagger
   * /previewusers:
   *    post:
   *       description: Create New PreviewUser
   *       consumes:
   *         - application/json
   *       parameters:
   *         - in: body
   *           name: user
   *           required: true
   *           schema:
   *             type: object
   *             $ref: '#/definitions/PreviewUser'
   *           description: PreviewUser Structure
   *       tags:
   *         - Preview Users
   *       produces:
   *         - application/json
   *       responses:
   *          '200':
   *            description: New ExperimentUser is created
   */
  @Post()
  public create(@Body() users: PreviewUser): Promise<PreviewUser> {
    return this.previewUserService.create(users);
  }

  /**
   * @swagger
   * /previewusers/{id}:
   *    put:
   *       description: Update PreviewUser
   *       consumes:
   *         - application/json
   *       parameters:
   *         - in: path
   *           name: id
   *           required: true
   *           schema:
   *             type: string
   *           description: PreviewUser ID
   *         - in: body
   *           name: user
   *           required: true
   *           schema:
   *             type: object
   *             $ref: '#/definitions/PreviewUser'
   *           description: PreviewUser Structure
   *       tags:
   *         - Preview Users
   *       produces:
   *         - application/json
   *       responses:
   *          '200':
   *            description: PreviewUser is updated
   */
  @Put('/:id')
  public update(
    @Param('id') id: string,
    @Body({ validate: { validationError: { target: false, value: false } } }) user: PreviewUser
  ): Promise<PreviewUser> {
    return this.previewUserService.update(id, user);
  }

  /**
   * @swagger
   * /previewusers/{id}:
   *    delete:
   *       description: Delete preview user
   *       parameters:
   *         - in: path
   *           name: id
   *           required: true
   *           schema:
   *             type: string
   *           description: Preview User Id
   *       tags:
   *         - Preview Users
   *       produces:
   *         - application/json
   *       responses:
   *          '200':
   *            description: Delete User By Id
   */
  @Delete('/:id')
  public delete(@Param('id') id: string): Promise<PreviewUser | undefined> {
    return this.previewUserService.delete(id);
  }
}
