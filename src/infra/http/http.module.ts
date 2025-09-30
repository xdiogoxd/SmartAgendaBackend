import { Module, forwardRef } from '@nestjs/common';

import { CancelAppointmentUseCase } from '@/domain/application/use-cases/appointments/cancel-appointment';
import { CompleteAppointmentUseCase } from '@/domain/application/use-cases/appointments/complete-appointment';
import { CreateAppointmentUseCase } from '@/domain/application/use-cases/appointments/create-appointment';
import { DeleteAppointmentUseCase } from '@/domain/application/use-cases/appointments/delete-appointment';
import { FindAppointmentByIdUseCase } from '@/domain/application/use-cases/appointments/find-appointment-by-id';
import { ListAppointmentsByDateRangeUseCase } from '@/domain/application/use-cases/appointments/list-appointments-by-date-range';
import { ListAppointmentsByMonthUseCase } from '@/domain/application/use-cases/appointments/list-appointments-by-month';
import { RescheduleAppointmentUseCase } from '@/domain/application/use-cases/appointments/reschedule-appointment';
import { UpdateAppointmentUseCase } from '@/domain/application/use-cases/appointments/update-appointment';
import { CreateCustomerUseCase } from '@/domain/application/use-cases/customer/create-customer';
import { GetAllCustomersByOrganizationUseCase } from '@/domain/application/use-cases/customer/get-all-customers-by-organization';
import { GetCustomerByIdAndOrganizationUseCase } from '@/domain/application/use-cases/customer/get-customer-by-id-and-organization';
import { GetCustomerByPhoneAndOrganizationUseCase } from '@/domain/application/use-cases/customer/get-customer-by-phone-and-organization';
import { GetCustomersByNameAndOrganizationUseCase } from '@/domain/application/use-cases/customer/get-customers-by-name-and-organization';
import { UpdateCustomerUseCase } from '@/domain/application/use-cases/customer/update-customer';
import { CreateOrganizationUseCase } from '@/domain/application/use-cases/organization/create-organization';
import { GetAllOrganizationsByUserUseCase } from '@/domain/application/use-cases/organization/get-all-organizations-by-user';
import { UpdateOrganizationUseCase } from '@/domain/application/use-cases/organization/update-organization';
import { CreateScheduleUseCase } from '@/domain/application/use-cases/schedule/create-schedule';
import { UpdateScheduleUseCase } from '@/domain/application/use-cases/schedule/update-schedule';
import { CreateServiceUseCase } from '@/domain/application/use-cases/service/create-service';
import { FindServiceByIdUseCase } from '@/domain/application/use-cases/service/find-service-by-id';
import { FindServiceByNameUseCase } from '@/domain/application/use-cases/service/find-service-by-name';
import { ListAllServicesByOrganizationUseCase } from '@/domain/application/use-cases/service/list-all-services-by-organization';
import { UpdateServiceUseCase } from '@/domain/application/use-cases/service/update-service';
import { CreateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/create-space-of-service';
import { FindSpaceOfServiceByIdUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-by-id';
import { FindSpaceOfServiceByNameUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-name';
import { ListAllSpacesOfServiceByOrganizationUseCase } from '@/domain/application/use-cases/space-of-service/list-all-spaces-of-service-by-organization';
import { UpdateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/update-space-of-service';
import { AuthenticateAccountUseCase } from '@/domain/application/use-cases/user/authenticate-account';
import { CreateAccountUseCase } from '@/domain/application/use-cases/user/create-account';
import { GetUserUseCase } from '@/domain/application/use-cases/user/get-user';

import { CryptographyModule } from '../cryptography/cryptography.module';
import { DatabaseModule } from '../database/database.module';
import { CreateAccountController } from './controllers/accounts/create-account.controller';
import { GetUserController } from './controllers/accounts/get-user.controller';
import { CancelAppointmentController } from './controllers/appointments/cancel-appointment.controller';
import { CompleteAppointmentController } from './controllers/appointments/complete-appointment.controller';
import { CreateAppointmentController } from './controllers/appointments/create-appointment.controller';
import { DeleteAppointmentController } from './controllers/appointments/delete-appointment.controller';
import { ListAppointmentsByDateRangeController } from './controllers/appointments/find-appointment-by-id.controller';
import { FindAppointmentByIdController } from './controllers/appointments/list-appointments-by-date-range.controller';
import { ListAppointmentsByMonthController } from './controllers/appointments/list-appointments-by-month.controller';
import { RescheduleAppointmentController } from './controllers/appointments/reschedule-appointment.controller';
import { UpdateAppointmentController } from './controllers/appointments/update-appointment.controller';
import { CreateCustomerController } from './controllers/customer/create-customer.controller';
import { GetAllCustomersByOrganizationController } from './controllers/customer/get-all-customers-by-organization.controller';
import { GetCustomerByIdAndOrganizationController } from './controllers/customer/get-customer-by-id-and-organization.controller';
import { GetCustomerByPhoneAndOrganizationController } from './controllers/customer/get-customer-by-phone-and-organization.controller';
import { GetCustomersByNameAndOrganizationController } from './controllers/customer/get-customers-by-name-and-organization.controller';
import { UpdateCustomerController } from './controllers/customer/update-customer.controller';
import { CreateOrganizationController } from './controllers/organizations/create-organization.controller';
import { GetAllOrganizationsByUserController } from './controllers/organizations/get-all-organizations-by-user.controller';
import { UpdateOrganizationController } from './controllers/organizations/update-organization.controller';
import { CreateScheduleController } from './controllers/schedules/create-schedule.controller';
import { UpdateScheduleController } from './controllers/schedules/update-schedule.controller';
import { CreateServiceController } from './controllers/services/create-service.controller';
import { FindServiceByIdController } from './controllers/services/find-service-by-id.controller';
import { FindServiceByNameController } from './controllers/services/find-service-by-name.controller';
import { ListAllServicesController } from './controllers/services/list-all-services.controller';
import { UpdateServiceController } from './controllers/services/update-service.controller';
import { AuthenticateController } from './controllers/sessions/authenticate.controller';
import { CreateSpaceOfServiceController } from './controllers/space-of-services/create-space-of-service.controller';
import { FindSpaceOfServiceByIdController } from './controllers/space-of-services/find-space-of-service-by-id.controller';
import { FindSpaceOfServiceByNameController } from './controllers/space-of-services/find-space-of-service-by-name.controller';
import { ListAllSpacesOfServiceByOrganizationController } from './controllers/space-of-services/list-all-spaces-of-service-by-organization.controller';
import { UpdateSpaceOfServiceController } from './controllers/space-of-services/update-space-of-service.controller';

@Module({
  imports: [forwardRef(() => DatabaseModule), CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    GetUserController,
    CreateOrganizationController,
    GetAllOrganizationsByUserController,
    UpdateOrganizationController,
    CreateScheduleController,
    UpdateScheduleController,
    CreateServiceController,
    FindServiceByIdController,
    FindServiceByNameController,
    ListAllServicesController,
    UpdateServiceController,
    CreateSpaceOfServiceController,
    FindSpaceOfServiceByNameController,
    FindSpaceOfServiceByIdController,
    ListAllSpacesOfServiceByOrganizationController,
    UpdateSpaceOfServiceController,
    CreateAppointmentController,
    FindAppointmentByIdController,
    UpdateAppointmentController,
    RescheduleAppointmentController,
    CancelAppointmentController,
    CompleteAppointmentController,
    ListAppointmentsByDateRangeController,
    ListAppointmentsByMonthController,
    DeleteAppointmentController,
    CreateCustomerController,
    GetAllCustomersByOrganizationController,
    GetCustomerByPhoneAndOrganizationController,
    GetCustomersByNameAndOrganizationController,
    GetCustomerByIdAndOrganizationController,
    UpdateCustomerController,
  ],
  providers: [
    CreateAccountUseCase,
    AuthenticateAccountUseCase,
    GetUserUseCase,
    CreateOrganizationUseCase,
    GetAllOrganizationsByUserUseCase,
    UpdateOrganizationUseCase,
    CreateScheduleUseCase,
    UpdateScheduleUseCase,
    CreateServiceUseCase,
    FindServiceByIdUseCase,
    FindServiceByNameUseCase,
    ListAllServicesByOrganizationUseCase,
    UpdateServiceUseCase,
    CreateSpaceOfServiceUseCase,
    FindSpaceOfServiceByNameUseCase,
    FindSpaceOfServiceByIdUseCase,
    ListAllSpacesOfServiceByOrganizationUseCase,
    UpdateSpaceOfServiceUseCase,
    CreateAppointmentUseCase,
    FindAppointmentByIdUseCase,
    UpdateAppointmentUseCase,
    RescheduleAppointmentUseCase,
    CancelAppointmentUseCase,
    CompleteAppointmentUseCase,
    ListAppointmentsByDateRangeUseCase,
    ListAppointmentsByMonthUseCase,
    DeleteAppointmentUseCase,
    CreateCustomerUseCase,
    GetAllCustomersByOrganizationUseCase,
    GetCustomerByIdAndOrganizationUseCase,
    GetCustomerByPhoneAndOrganizationUseCase,
    GetCustomersByNameAndOrganizationUseCase,
    UpdateCustomerUseCase,
  ],
})
export class HttpModule {}
