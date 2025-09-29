"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Check, 
  X, 
  Download,
  CalendarRange,
  DollarSign,
  User,
  Building,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ContractWithAthlete, PaymentSchedule } from "@/types/contract";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<ContractWithAthlete | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingContract, setIsDeletingContract] = useState<boolean>(false);

  useEffect(() => {
    async function fetchContractDetails() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("contracts")
          .select(`
            *,
            athlete:athletes(id, first_name, last_name, position, image_url)
          `)
          .eq("id", params.id)
          .single();

        if (error) {
          throw error;
        }

        setContract({
          ...data,
          athlete: data.athlete as any
        });
      } catch (err: any) {
        console.error("Error fetching contract details:", err);
        setError("Failed to load contract details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContractDetails();
  }, [params.id]);

  const handleDeleteContract = async () => {
    setIsDeletingContract(true);

    try {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", params.id);

      if (error) {
        throw error;
      }

      router.push("/dashboard/contracts");
    } catch (err: any) {
      console.error("Error deleting contract:", err);
      setError(`Failed to delete contract: ${err.message}`);
      setIsDeletingContract(false);
    }
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return "default";
      case 'pending':
        return "secondary";
      case 'draft':
        return "outline";
      case 'expired':
      case 'terminated':
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/dashboard/contracts")}
        >
          Back to Contracts
        </Button>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-muted-foreground">Contract not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/dashboard/contracts")}
        >
          Back to Contracts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push("/dashboard/contracts")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/contracts/${params.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit Contract
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Contract</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this contract? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteContract}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeletingContract}
                >
                  {isDeletingContract ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
            <p className="text-muted-foreground">
              {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)} contract with {contract.partner}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(contract.status) as any} className="capitalize">
            {contract.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Summary</CardTitle>
            <CardDescription>Key contract information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(contract.value)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <CalendarRange className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract Period</p>
                <p className="font-medium">
                  {format(new Date(contract.start_date), "MMM d, yyyy")} - {format(new Date(contract.end_date), "MMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Athlete</p>
                <Link href={`/dashboard/athletes/${contract.athlete_id}`} className="font-medium hover:underline">
                  {contract.athlete.first_name} {contract.athlete.last_name}
                </Link>
                <p className="text-sm text-muted-foreground">{contract.athlete.position}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partner</p>
                <p className="font-medium">{contract.partner}</p>
              </div>
            </div>

            {contract.terms_document_url && (
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Document</p>
                  <a
                    href={contract.terms_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center"
                  >
                    View Document
                    <Download className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Schedule Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
            <CardDescription>Scheduled payments for this contract</CardDescription>
          </CardHeader>
          <CardContent>
            {contract.payment_schedule && (contract.payment_schedule as PaymentSchedule[]).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(contract.payment_schedule as PaymentSchedule[]).map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {payment.description || `Payment ${index + 1}`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.due_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {payment.paid ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span className="text-green-500">Paid</span>
                              {payment.paid_date && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  on {format(new Date(payment.paid_date), "MMM d, yyyy")}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>Pending</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No payment schedule defined for this contract.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-sm text-muted-foreground">Total Scheduled: </span>
                <span className="font-medium">
                  {contract.payment_schedule 
                    ? formatCurrency((contract.payment_schedule as PaymentSchedule[]).reduce((sum, payment) => sum + payment.amount, 0))
                    : "$0"}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Contract Value: </span>
                <span className="font-medium">
                  {formatCurrency(contract.value)}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Notes Card */}
        {contract.notes && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{contract.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
