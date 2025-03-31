import SubscriptionModel from "@/components/backend/api/subscription/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Verify user authentication
    const { userId, token, email, name, role } = await verifyToken(request);

    // Parse query parameters properly
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const rowsPerPage = parseInt(url.searchParams.get("rowsPerPage")) || 10;
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "lth";
    const filter = url.searchParams.get("filter") || "name";

    // Construct query
    const query = { name: { $regex: search, $options: "i" } };

    // Fetch subscriptions with sorting, pagination
    const subscriptions = await SubscriptionModel.find(query)
      .sort({ [filter]: sort === "lth" ? 1 : -1 })
      .skip((page - 1) * rowsPerPage)
      .limit(rowsPerPage)
      .lean();

    // Get total filtered count
    const filterCount = await SubscriptionModel.countDocuments(query);

    // Get total count of all subscriptions
    const totalCount = await SubscriptionModel.countDocuments({});

    return NextResponse.json({
      data: subscriptions,
      totalCount,
      filterCount,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const verifySubscription = await SubscriptionModel.findOne({
      name: body.name,
    });

    if (verifySubscription) {
      return NextResponse.json(
        { message: "Subscription already exists" },
        { status: 400 }
      );
    }

    await SubscriptionModel.create({
      name: body.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      requests: body.requests,
      ramLimit: body.ramLimit,
      cpuLimit: body.cpuLimit,
      price: body.price,
      projectLimit: body.projectLimit,
      apiLimit: body.apiLimit,
    });

    return NextResponse.json(
      { message: "Subscription created successfully" },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
