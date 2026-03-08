import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrentDate } from "@/components/CurrentDate";
import { PrintReceipt } from "@/components/PrintReceit";
import { PaymentHistoryModal } from "@/components/PaymentHistoryModal";
import { LoadingState, LoadingSkeleton } from "@/loaders/dataLoader";
import { ErrorState } from "@/errors/dataError";
import { HOUSE_PRICES, Tenant, HouseSize } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useBuilding, BUILDINGS } from "@/contexts/BuildingContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAddDialogOpen,
  setBuilding,
  setStatusFilter,
  setTenants,
  setIsEditDialogOpen,
  setEditingTenant,
  setReceiptTenant,
  setPaymentHistoryTenant,
  setSelectedMonth,
  setSelectedYear,
  fetchTenants,
  updateTenantInList,
  deleteTenantFromList,
} from "@/slices/TenantsSlice";
import { formatDate, generateYears, MONTHS } from "@/utils/utils";
import { icons } from "./../utils/utils";
import {
  createTenant,
  updateTenant,
  deleteTenant,
  tenantFormSchema,
  TenantFormValues,
} from "../Apis/newTenantApi";

export function Tenants() {
  const dispatch = useAppDispatch();
  const buildingFilter = useAppSelector(
    (state) => state.tenants.buildingFilter
  );
  const statusFilter = useAppSelector((state) => state.tenants.statusFilter);
  const { tenants, loading, error } = useAppSelector((state) => state.tenants);
  const isAddDialogOpen = useAppSelector(
    (state) => state.tenants.isAddDialogOpen
  );
  const isEditDialogOpen = useAppSelector(
    (state) => state.tenants.isEditDialogOpen
  );
  const editingTenant = useAppSelector((state) => state.tenants.editingTenant);
  const receiptTenant = useAppSelector((state) => state.tenants.receiptTenant);
  const paymentHistoryTenant = useAppSelector(
    (state) => state.tenants.paymentHistoryTenant
  );
  const selectedMonth = useAppSelector((state) => state.tenants.selectedMonth);
  const selectedYear = useAppSelector((state) => state.tenants.selectedYear);

  useEffect(() => {
    dispatch(fetchTenants({ month: selectedMonth, year: selectedYear }));
  }, [selectedMonth, selectedYear, dispatch]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [tenantToDelete, setTenantToDelete] = React.useState<Tenant | null>(
    null
  );
  const [editTenantStatus, setEditTenantStatus] = React.useState<
    "active" | "left"
  >("active");
  const [selectedHouseSize, setSelectedHouseSize] =
    React.useState<HouseSize>("1_bedroom");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const { getBuildingByCode } = useBuilding();

  // Calculate deposit based on house size
  const calculateDeposit = (houseSize: HouseSize) => {
    const priceRange = HOUSE_PRICES[houseSize];
    if (!priceRange?.max) return 0;
    return priceRange.max;
  };

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      nextOfKinName: "",
      nextOfKinMobile: "",
      houseNumber: "",
      houseSize: "1_bedroom",
      area: "",
      buildingName: "001",
      depositPaid: 0,
    },
  });

  const editForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
  });

  const handleRetry = () => {
    dispatch(fetchTenants({ month: selectedMonth, year: selectedYear }));
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Calculate effective balance after applying advance balance
  const calculateEffectiveBalance = (tenant: Tenant) => {
    const totalBill =
      tenant.monthlyRent +
      tenant.waterBill +
      tenant.garbageBill +
      tenant.penalties;
    const advanceBalance = tenant.advanceBalance || 0;

    if (advanceBalance > 0) {
      const remainingBalance = totalBill - advanceBalance;
      return Math.max(0, remainingBalance);
    }

    return tenant.balanceDue;
  };

  const filteredTenants = tenants?.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.mobile.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || tenant?.status === statusFilter;
    const matchesBuilding =
      buildingFilter === "all" || tenant?.buildingName === buildingFilter;
    return matchesSearch && matchesStatus && matchesBuilding;
  });

  const getPaymentStatus = (tenant: Tenant) => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const effectiveBalance = calculateEffectiveBalance(tenant);

    if (effectiveBalance === 0) {
      return "paid";
    }
    if (dayOfMonth < 5) {
      return "pending";
    }
    if (effectiveBalance > 0) {
      return "overdue";
    }
    return "pending";
  };

  const onSubmit = async (values: TenantFormValues) => {
    try {
      const priceRange = HOUSE_PRICES[values.houseSize as HouseSize];
      const monthlyRent = Math.round((priceRange?.min + priceRange?.max) / 2);
      const depositPaid =
        values.depositPaid || calculateDeposit(values.houseSize as HouseSize);

      const payload = {
        ...values,
        monthlyRent,
        depositPaid,
        status: "active" as const,
      };

      const { data: tenant } = await createTenant(payload);
      dispatch(setTenants(tenant));
      form.reset();
      dispatch(setAddDialogOpen(false));
      toast({
        title: "Tenant added",
        description: `${
          tenant.name
        } has been added successfully with deposit of ${formatCurrency(
          depositPaid
        )}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add tenant",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    dispatch(setEditingTenant(tenant));
    setEditTenantStatus(tenant.status);
    editForm.reset({
      name: tenant.name,
      mobile: tenant.mobile,
      nextOfKinName: tenant.nextOfKinName || "",
      nextOfKinMobile: tenant.nextOfKinMobile || "",
      houseNumber: tenant.houseNumber,
      houseSize: tenant.houseSize,
      area: tenant.area || "",
      buildingName: tenant.buildingName,
      depositPaid: tenant.depositPaid || 0,
    });
    dispatch(setIsEditDialogOpen(true));
  };

  const handleUpdateTenant = async (values: TenantFormValues) => {
    if (!editingTenant) return;
    try {
      const priceRange = HOUSE_PRICES[values.houseSize as HouseSize];
      const monthlyRent = Math.round((priceRange?.min + priceRange?.max) / 2);
      const payload = {
        ...values,
        monthlyRent,
        status: editTenantStatus,
        depositPaid: values.depositPaid,
      };
      const { data: updatedTenant } = await updateTenant(
        editingTenant.id,
        payload
      );
      dispatch(updateTenantInList(updatedTenant));
      dispatch(setIsEditDialogOpen(false));
      toast({
        title: "Tenant updated",
        description: `${updatedTenant.name} has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update tenant",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    try {
      await deleteTenant(tenantToDelete.id);
      dispatch(deleteTenantFromList(tenantToDelete.id));
      setIsDeleteDialogOpen(false);
      setTenantToDelete(null);
      toast({
        title: "Tenant deleted",
        description: `${tenantToDelete.name} has been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete tenant",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  const handlePrintReceipt = (tenant: Tenant) => {
    const effectiveBalance = calculateEffectiveBalance(tenant);
    if (effectiveBalance > 0) {
      toast({
        title: "Cannot print receipt",
        description: "Receipt can only be printed for fully paid tenants.",
        variant: "destructive",
      });
      return;
    }
    dispatch(setReceiptTenant(tenant));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentDate />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your tenants in one place
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            dispatch(setAddDialogOpen(open));
            if (!open) form.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg">
              <icons.plus className="w-5 h-5" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile *</FormLabel>
                        <FormControl>
                          <Input placeholder="+254712345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nextOfKinName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextOfKinMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="+254711111111" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="A101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="houseSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Size *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedHouseSize(value as HouseSize);
                            const deposit = calculateDeposit(
                              value as HouseSize
                            );
                            form.setValue("depositPaid", deposit);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(HOUSE_PRICES).map(
                              ([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value.label} (KSH{" "}
                                  {value?.min?.toLocaleString()} -{" "}
                                  {value?.max?.toLocaleString()})
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area/Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Westlands, Nairobi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buildingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select building" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUILDINGS.map((building) => (
                              <SelectItem
                                key={building.code}
                                value={building.name}
                              >
                                {building.icon} {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="depositPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Required *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Default:{" "}
                        {formatCurrency(calculateDeposit(selectedHouseSize))}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4">
                  Add Tenant
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <icons.calendar className="w-5 h-5" />
            Filter by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Month
              </Label>
              <Select
                value={selectedMonth}
                onValueChange={(v) => dispatch(setSelectedMonth(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Year
              </Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => dispatch(setSelectedYear(parseInt(v)))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">
            House Prices (KSH)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(HOUSE_PRICES).map(([key, value]) => (
              <div key={key} className="px-4 py-2 bg-muted rounded-lg">
                <span className="font-medium text-foreground">
                  {value.label}:
                </span>
                <span className="text-muted-foreground ml-2">
                  {value?.min?.toLocaleString()} -{" "}
                  {value?.max?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, house number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            dispatch(setStatusFilter(v as "all" | "active" | "left"))
          }
        >
          <SelectTrigger className="w-full sm:w-44 h-11">
            <icons.filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tenants</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="left">Left</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={buildingFilter}
          onValueChange={(value) => dispatch(setBuilding(value))}
        >
          <SelectTrigger className="w-full sm:w-52 h-11">
            <icons.building2 className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {BUILDINGS.map((building) => (
              <SelectItem key={building.code} value={building.name}>
                {building.icon} {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  Tenant
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <icons.building2 className="w-4 h-4" />
                    Building
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  House
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  Rent
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <icons.droplets className="w-4 h-4" />
                    Water
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <icons.trash2 className="w-4 h-4" />
                    Garbage
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <icons.trendingUp className="w-4 h-4" />
                    Advance
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  Balance
                </th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-right py-4 px-4 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants?.map((tenant) => {
                const paymentStatus = getPaymentStatus(tenant);
                const building = getBuildingByCode(tenant.buildingName);
                const isInactive = tenant.status === "left";
                const effectiveBalance = calculateEffectiveBalance(tenant);
                const advanceBalance = tenant.advanceBalance || 0;

                return (
                  <tr
                    key={tenant.id}
                    className={cn(
                      "border-b border-border transition-colors",
                      isInactive
                        ? "bg-muted/60 opacity-60"
                        : paymentStatus === "overdue"
                        ? "status-overdue"
                        : paymentStatus === "paid"
                        ? "status-paid"
                        : "hover:bg-muted/30"
                    )}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            isInactive
                              ? "text-muted-foreground"
                              : "text-foreground"
                          )}
                        >
                          {tenant.name}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <icons.phone className="w-3 h-3" />
                          {tenant.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span>{building?.icon}</span>
                        <p
                          className={cn(
                            "font-medium text-xs",
                            isInactive
                              ? "text-muted-foreground"
                              : "text-foreground"
                          )}
                        >
                          {tenant?.buildingName}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            isInactive
                              ? "text-muted-foreground"
                              : "text-foreground"
                          )}
                        >
                          {tenant.houseNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {HOUSE_PRICES[tenant?.houseSize]?.label}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p
                        className={cn(
                          "font-medium",
                          isInactive
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {formatCurrency(tenant.monthlyRent)}
                      </p>
                      {tenant.penalties > 0 && (
                        <p className="text-sm text-danger">
                          +{formatCurrency(tenant.penalties)} penalty
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">
                        {formatCurrency(tenant.waterBill)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">
                        {formatCurrency(tenant.garbageBill)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {advanceBalance > 0 ? (
                        <div>
                          <p className="font-medium text-success">
                            {formatCurrency(advanceBalance)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Previous month
                          </p>
                        </div>
                      ) : (
                        <p className="font-medium text-muted-foreground">-</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p
                          className={cn(
                            "font-bold",
                            effectiveBalance === 0
                              ? "text-success"
                              : "text-danger"
                          )}
                        >
                          {formatCurrency(effectiveBalance)}
                        </p>
                        {advanceBalance > 0 && (
                          <p className="text-xs text-muted-foreground">
                            (after advance:{" "}
                            {formatCurrency(tenant.balanceDue - advanceBalance)}
                            )
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          tenant.status === "active"
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {tenant.status === "active" ? "Active" : "Left"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(tenant)}
                          title="View Details"
                        >
                          <icons.eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTenant(tenant)}
                          title="Edit Tenant"
                        >
                          <icons.edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-danger"
                          onClick={() => {
                            setTenantToDelete(tenant);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete Tenant"
                        >
                          <icons.trash2 className="w-4 h-4" />
                        </Button>
                        {effectiveBalance === 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success"
                            onClick={() => handlePrintReceipt(tenant)}
                            title="Print Receipt"
                          >
                            <icons.printer className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary"
                          onClick={() =>
                            dispatch(setPaymentHistoryTenant(tenant))
                          }
                          title="View Payments"
                        >
                          <icons.creditcard className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTenants?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No tenants found matching your criteria.
            </p>
          </div>
        )}
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => dispatch(setIsEditDialogOpen(open))}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          {editingTenant && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleUpdateTenant)}
                className="space-y-4 py-4"
              >
                {/* Status Update Section */}
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <Label className="text-sm font-medium">
                      Current Status
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          editTenantStatus === "active"
                            ? "bg-success/20 text-success"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        )}
                      >
                        {editTenantStatus === "active" ? "Active" : "Left"}
                      </span>
                      {editingTenant.leavingDate && (
                        <span className="text-xs text-muted-foreground">
                          Left on:{" "}
                          {new Date(
                            editingTenant.leavingDate
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        editTenantStatus === "active" ? "default" : "outline"
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditTenantStatus("active")}
                    >
                      Mark as Active
                    </Button>
                    <Button
                      type="button"
                      variant={
                        editTenantStatus === "left" ? "destructive" : "outline"
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditTenantStatus("left")}
                    >
                      Mark as Left
                    </Button>
                  </div>
                  {editTenantStatus === "left" &&
                    editingTenant.status === "active" && (
                      <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-xs text-warning-foreground">
                          <strong>Note:</strong> Leaving date will be set to
                          today when you save.
                        </p>
                      </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="nextOfKinName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="nextOfKinMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Mobile</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Number *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="houseSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Size *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(HOUSE_PRICES).map(
                              ([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area/Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="buildingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUILDINGS.map((building) => (
                              <SelectItem
                                key={building.code}
                                value={building.name}
                              >
                                {building.icon} {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full mt-4">
                  Update Tenant
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
          </DialogHeader>
          {tenantToDelete && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
                <p className="text-sm text-danger-foreground">
                  <strong>Warning:</strong> This action cannot be undone. All
                  data associated with this tenant will be permanently deleted.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold text-foreground">
                  {tenantToDelete.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tenantToDelete.houseNumber} - {tenantToDelete.mobile}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setTenantToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteTenant}
                >
                  Delete Tenant
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {receiptTenant && (
        <PrintReceipt
          tenant={receiptTenant}
          isOpen={!!receiptTenant}
          onClose={() => dispatch(setReceiptTenant(null))}
          month={selectedMonth}
          year={selectedYear}
        />
      )}

      {paymentHistoryTenant && (
        <PaymentHistoryModal
          tenant={paymentHistoryTenant}
          isOpen={!!paymentHistoryTenant}
          onClose={() => dispatch(setPaymentHistoryTenant(null))}
        />
      )}
    </div>
  );
}
