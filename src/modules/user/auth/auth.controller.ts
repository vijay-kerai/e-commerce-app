import db from '../../../config.database';
import response from '../../../utils/response';
import jwtToken from 'jsonwebtoken';
import express, { Express, Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize'
import Email from '../../../utils/sendMail';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const User = db.users;
const Vendor = db.vendors;

const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const alreadyUser = await User.findOne({ where: { email: res.locals.user.email } });
    if (alreadyUser) {
        return response.errorResponse(res, 400, 'This email already taken Please use login');
    }

    const round: number = Number(process.env.BCRYPT_ROUND) || 12;
    const hashPassword = await bcrypt.hash(res.locals.user.password, round);
    res.locals.user.password = hashPassword;

    const user = await User.create(res.locals.user);
    if (user) {
        const id = user.id
        const token = jwtToken.sign({ id }, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRES_IN });
        const url = `${req.protocol}://${req.get('host')}/me`;
        Email(user, 'welcomeEmail', '');
        return response.response(res, 201, { user, token, }, 'SignUp successful');
    }
    return response.errorResponse(res, 400, 'Error creating user');
});

const login = catchAsync(async (req: Request, res: Response,) => {
    const user = await User.findOne({ where: { email: res.locals.user.email } });
    if (!user) {
        return response.errorResponse(res, 400, 'Invalid email or password');
    }
    if (user.status === 'inactive') {
        return response.errorResponse(res, 400, 'Your account is inactive Please contact admin');
    }
    const isMatch = await bcrypt.compare(res.locals.user.password, user.password);
    if (!isMatch) {
        return response.errorResponse(res, 400, 'Invalid email or password');
    }
    const id = user.id;
    const token = jwtToken.sign({ id }, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRES_IN });
    return response.response(res, 201, { user, token }, 'SignIn successful');
});

const vendorLogin = catchAsync(async (req: Request, res: Response,) => {
    if (!res.locals.vendor.email && !res.locals.vendor.username) {
        return response.errorResponse(res, 400, 'Please enter email or username');
    }
    let whereCase = {};
    if (res.locals.vendor.email) {
        whereCase = { email: res.locals.vendor.email }
    }
    else if (res.locals.vendor.username) {
        whereCase = { username: res.locals.vendor.username }
    }
    const vendor = await Vendor.findOne({
        where: whereCase
    });
    if (!vendor) {
        return response.errorResponse(res, 400, 'Invalid email or password');
    }
    if (vendor.status === 'inactive') {
        return response.errorResponse(res, 400, 'Your account is inactive Please contact admin');
    }
    const isMatch = await bcrypt.compare(res.locals.vendor.password, vendor.password);
    if (!isMatch) {
        return response.errorResponse(res, 400, 'Invalid email or password');
    }
    const email = vendor.email;
    const token = jwtToken.sign({ email }, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRES_IN });
    return response.response(res, 201, { vendor, token }, 'SignIn successful');
});

const changePassword = catchAsync(async (req: Request, res: Response,) => {
    const user = await User.findOne({ where: { id: res.locals.user.id } });
    const isMatch = await bcrypt.compare(res.locals.changePassword.currentPassword, user.password);
    if (!isMatch) {
        return response.errorResponse(res, 400, 'Invalid current password');
    }
    if (res.locals.changePassword.currentPassword === res.locals.changePassword.newPassword) {
        return response.errorResponse(res, 400, 'New password cannot be same as current password');
    }
    const round: number = Number(process.env.BCRYPT_ROUND) || 12;
    const hashPassword = await bcrypt.hash(res.locals.changePassword.newPassword, round);
    const updateUser = await User.update({ password: hashPassword }, { where: { id: res.locals.user.id } });
    const token = '';
    if (updateUser) {
        return response.response(res, 200, { token }, 'Password changed successfully. please login again with this password');
    }
    return response.errorResponse(res, 400, 'Error changing password');
});

const logout = catchAsync(async (req: Request, res: Response,) => {
    const token = ''
    return response.response(res, 200, {token}, 'Logout successful');
});



export default {
    signup,
    login,
    vendorLogin,
    logout,
    changePassword
}