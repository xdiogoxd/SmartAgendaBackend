import { forwardRef, Module } from '@nestjs/common';
import { AuthenticateController } from './controllers/sessions/authenticate.controller';
import { CreateAccountController } from './controllers/accounts/create-account.controller';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { CreateAccountUseCase } from '@/domain/application/use-cases/user/create-account';
import { AuthenticateAccountUseCase } from '@/domain/application/use-cases/user/authenticate-account';
import { CreateServiceController } from './controllers/services/create-service.controller';
import { CreateServiceUseCase } from '@/domain/application/use-cases/service/create-service';
import { UpdateServiceController } from './controllers/services/update-service.controller';
import { UpdateServiceUseCase } from '@/domain/application/use-cases/service/update-service';
import { FindServiceByIdController } from './controllers/services/find-service-by-id.controller';
import { FindServiceByNameController } from './controllers/services/find-service-by-name.controller';
import { CreateOrganizationController } from './controllers/organizations/create-organization.controller';
import { UpdateOrganizationController } from './controllers/organizations/update-organization.controller';
import { CreateScheduleController } from './controllers/schedules/create-schedule.controller';
import { CreateOrganizationUseCase } from '@/domain/application/use-cases/organization/create-organization';
import { UpdateOrganizationUseCase } from '@/domain/application/use-cases/organization/update-organization';
import { CreateScheduleUseCase } from '@/domain/application/use-cases/schedule/create-schedule';
import { ListAllServicesController } from './controllers/services/list-all-services.controller';
import { FindServiceByIdUseCase } from '@/domain/application/use-cases/service/find-service-by-id';
import { FindServiceByNameUseCase } from '@/domain/application/use-cases/service/find-service-by-name';
import { ListAllServicesByOrganizationUseCase } from '@/domain/application/use-cases/service/list-all-services-by-organization';
import { UpdateScheduleController } from './controllers/schedules/update-schedule.controller';
import { UpdateScheduleUseCase } from '@/domain/application/use-cases/schedule/update-schedule';
import { CreateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/create-space-of-service';
import { FindSpaceOfServiceByNameUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-name';
import { ListAllSpacesOfServiceByOrganizationUseCase } from '@/domain/application/use-cases/space-of-service/list-all-spaces-of-service-by-organization';
import { UpdateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/update-space-of-service';
import { CreateSpaceOfServiceController } from './controllers/space-of-services/create-space-of-service.controller';
import { FindSpaceOfServiceByNameController } from './controllers/space-of-services/find-space-of-service-by-name.controller';
import { ListAllSpacesOfServiceByOrganizationController } from './controllers/space-of-services/list-all-spaces-of-service-by-organization.controller';
import { UpdateSpaceOfServiceController } from './controllers/space-of-services/update-space-of-service.controller';
import { FindSpaceOfServiceByIdController } from './controllers/space-of-services/find-space-of-service-by-id.controller';
import { FindSpaceOfServiceByIdUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-by-id';
import { CreateAppointmentController } from './controllers/appointments/create-appointment.controller';
import { CancelAppointmentController } from './controllers/appointments/cancel-appointment.controller';
import { CompleteAppointmentController } from './controllers/appointments/complete-appointment.controller';
import { ListAppointmentsByDateRangeController } from './controllers/appointments/list-appointments-by-date-range.controller';
import { RescheduleAppointmentController } from './controllers/appointments/reschedule-appointment.controller';
import { UpdateAppointmentController } from './controllers/appointments/update-appointment.controller';
import { ListAppointmentsByMonthController } from './controllers/appointments/list-appointments-by-month.controller';
import { CreateAppointmentUseCase } from '@/domain/application/use-cases/appointments/create-appointment';
import { UpdateAppointmentUseCase } from '@/domain/application/use-cases/appointments/update-appointment';
import { RescheduleAppointmentUseCase } from '@/domain/application/use-cases/appointments/reschedule-appointment';
import { CancelAppointmentUseCase } from '@/domain/application/use-cases/appointments/cancel-appointment';
import { CompleteAppointmentUseCase } from '@/domain/application/use-cases/appointments/complete-appointment';
import { ListAppointmentsByDateRangeUseCase } from '@/domain/application/use-cases/appointments/list-appointments-by-date-range';
import { ListAppointmentsByMonthUseCase } from '@/domain/application/use-cases/appointments/list-appointments-by-month';
import { DeleteAppointmentController } from './controllers/appointments/delete-appointment.controller';
import { DeleteAppointmentUseCase } from '@/domain/application/use-cases/appointments/delete-appointment';
import { GetAllOrganizationsByUserController } from './controllers/organizations/get-all-organizations-by-user';
import { GetAllOrganizationsByUserUseCase } from '@/domain/application/use-cases/organization/get-all-organizations-by-user';

@Module({
  imports: [forwardRef(() => DatabaseModule), CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
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
    UpdateAppointmentController,
    RescheduleAppointmentController,
    CancelAppointmentController,
    CompleteAppointmentController,
    ListAppointmentsByDateRangeController,
    ListAppointmentsByMonthController,
    DeleteAppointmentController,
  ],
  providers: [
    CreateAccountUseCase,
    AuthenticateAccountUseCase,
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
    UpdateAppointmentUseCase,
    RescheduleAppointmentUseCase,
    CancelAppointmentUseCase,
    CompleteAppointmentUseCase,
    ListAppointmentsByDateRangeUseCase,
    ListAppointmentsByMonthUseCase,
    DeleteAppointmentUseCase,
  ],
})
export class HttpModule {}
